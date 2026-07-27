import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';

const API_URL = process.env.NEXT_PUBLIC_SENTRY_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3,
  backoffMs = 500
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.status >= 500 && attempt < retries && (!options.method || options.method === 'GET')) {
        await new Promise(r => setTimeout(r, backoffMs * Math.pow(2, attempt)));
        continue;
      }
      return res;
    } catch (err) {
      if (attempt === retries || (options.method && options.method !== 'GET')) throw err;
      await new Promise(r => setTimeout(r, backoffMs * Math.pow(2, attempt)));
    }
  }
  throw new Error('Unreachable');
}

export async function fetchApi<T>(
  schema: z.ZodSchema<T>,
  path: string, 
  options?: RequestInit
): Promise<T> {
  const fetchOptions = {
    ...options,
    credentials: "include" as RequestCredentials,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  };

  const res = await fetchWithRetry(`${API_URL}${path}`, fetchOptions);

  if (!res.ok) {
    let errorBody: Record<string, unknown> = {};
    try {
      errorBody = await res.json();
    } catch {
      errorBody = { message: res.statusText };
    }
    const message = typeof errorBody.message === "string" ? errorBody.message : res.statusText;
    const apiError = new ApiError(res.status, message, errorBody);
    Sentry.captureException(apiError, {
      tags: { status: res.status, url: path },
      extra: { body: errorBody }
    });
    throw apiError;
  }

  const text = await res.text();
  if (!text) {
    // If the schema expects undefined/null, let it parse, otherwise it throws.
    return schema.parse(null);
  }

  try {
    const json = JSON.parse(text);
    return schema.parse(json);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      console.error(`Zod Validation Error at ${path}:`, err.errors);
      Sentry.captureException(err, {
        tags: { type: 'zod_validation_error', url: path },
        extra: { zodErrors: err.errors, rawText: text.substring(0, 500) }
      });
      throw new Error(`Invalid API response shape for ${path}`);
    }
    // Handle edge cases where response is raw text but schema might accept it
    return schema.parse(text);
  }
}
