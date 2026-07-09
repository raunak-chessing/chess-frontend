import { z } from "zod";
import { loginSchema, signupSchema } from "../schemas/auth.schemas";

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
