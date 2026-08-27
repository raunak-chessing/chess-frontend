import { z } from 'zod';
import { fetchApi } from '@/lib/api-client';
import { shopItemSchema, inventoryItemSchema } from '@/features/inventory/api/inventoryApi';

export const shopApi = {
  getCatalog: () => fetchApi(z.array(shopItemSchema), '/api/shop'),
  purchase: (shopItemId: string) => fetchApi(inventoryItemSchema, `/api/shop/purchase/${shopItemId}`, { method: 'POST' }),
};
