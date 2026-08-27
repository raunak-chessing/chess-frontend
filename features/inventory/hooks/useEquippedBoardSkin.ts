import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { inventoryApi } from '../api/inventoryApi';
import { DEFAULT_BOARD_SKIN, BOARD_SKINS, type BoardSkin } from '@/features/game/constants/boardTheme';

export function useEquippedBoardSkin(): BoardSkin {
  const { data: session } = authClient.useSession();
  const [skin, setSkin] = useState<BoardSkin>(DEFAULT_BOARD_SKIN);

  useEffect(() => {
    if (!session) {
      setSkin(DEFAULT_BOARD_SKIN);
      return;
    }

    inventoryApi.getMyInventory()
      .then((inventory) => {
        const equipped = inventory.items.find((item) => item.equipped && item.shopItem.type === 'BOARD_THEME');
        setSkin(equipped ? (BOARD_SKINS[equipped.shopItem.key] ?? DEFAULT_BOARD_SKIN) : DEFAULT_BOARD_SKIN);
      })
      .catch(() => setSkin(DEFAULT_BOARD_SKIN));
  }, [session]);

  return skin;
}
