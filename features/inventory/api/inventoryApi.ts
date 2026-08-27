import { z } from 'zod';
import { fetchApi } from '@/lib/api-client';

export const cosmeticTypeSchema = z.enum(['BOARD_THEME', 'PIECE_SET', 'AVATAR_FRAME']);
export type CosmeticType = z.infer<typeof cosmeticTypeSchema>;

export const shopItemSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  description: z.string(),
  type: cosmeticTypeSchema,
  rarity: z.string(),
  priceGold: z.number().nullable(),
  priceAetherium: z.number().nullable(),
  imageUrl: z.string().nullable(),
});
export type ShopItem = z.infer<typeof shopItemSchema>;

export const inventoryItemSchema = z.object({
  id: z.string(),
  inventoryId: z.string(),
  shopItemId: z.string(),
  equipped: z.boolean(),
  acquiredAt: z.coerce.date(),
  shopItem: shopItemSchema,
});
export type InventoryItem = z.infer<typeof inventoryItemSchema>;

export const playerInventorySchema = z.object({
  gold: z.number(),
  aetherium: z.number(),
  items: z.array(inventoryItemSchema),
});
export type PlayerInventory = z.infer<typeof playerInventorySchema>;

export const inventoryApi = {
  getMyInventory: () => fetchApi(playerInventorySchema, '/api/inventory'),
  equipItem: (itemId: string) => fetchApi(playerInventorySchema, `/api/inventory/equip/${itemId}`, { method: 'POST' }),
  unequipItem: (itemId: string) => fetchApi(playerInventorySchema, `/api/inventory/unequip/${itemId}`, { method: 'POST' }),
};
