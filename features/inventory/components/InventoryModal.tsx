import React, { useEffect, useState } from 'react';
import { inventoryApi, PlayerInventory } from '../api/inventoryApi';
import { X, Coins, Sparkles, Package, Check } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from 'react-hot-toast';

interface InventoryModalProps {
  onClose: () => void;
}

const COSMETIC_ICONS: Record<string, string> = {
  BOARD_THEME: '🎨',
  PIECE_SET: '♟️',
  AVATAR_FRAME: '🖼️',
};

export function InventoryModal({ onClose }: InventoryModalProps) {
  const [inventory, setInventory] = useState<PlayerInventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);

  useEffect(() => {
    inventoryApi.getMyInventory()
      .then(data => {
        setInventory(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const toggleEquip = async (itemId: string, equipped: boolean) => {
    setPendingItemId(itemId);
    try {
      const updated = equipped
        ? await inventoryApi.unequipItem(itemId)
        : await inventoryApi.equipItem(itemId);
      setInventory(updated);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update item');
    } finally {
      setPendingItemId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="My Inventory"
        className="w-full max-w-md bg-cc-bg-card border border-cc-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        <div className="p-4 border-b border-cc-border flex items-center justify-between bg-cc-bg-sidebar/50">
          <h2 className="text-lg font-bold text-cc-text-primary flex items-center gap-2">
            <Package className="text-indigo-400" size={20} /> My Inventory
          </h2>
          <button
            onClick={onClose}
            aria-label="Close inventory"
            className="p-1.5 text-cc-text-muted hover:text-cc-text-primary rounded-md hover:bg-cc-bg-hover transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : inventory ? (
            <div className="space-y-6">
              {/* Currencies */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-cc-bg-sidebar/50 border border-cc-border p-4 rounded-xl flex flex-col items-center justify-center gap-2">
                  <Coins className="text-amber-400" size={32} />
                  <div className="text-center">
                    <div className="text-2xl font-black text-amber-500 font-mono tracking-tight">{inventory.gold.toLocaleString()}</div>
                    <div className="text-[10px] uppercase font-bold text-cc-text-secondary tracking-wider">Gold</div>
                  </div>
                </div>
                <div className="bg-cc-bg-sidebar/50 border border-cc-border p-4 rounded-xl flex flex-col items-center justify-center gap-2">
                  <Sparkles className="text-purple-400" size={32} />
                  <div className="text-center">
                    <div className="text-2xl font-black text-purple-400 font-mono tracking-tight">{inventory.aetherium.toLocaleString()}</div>
                    <div className="text-[10px] uppercase font-bold text-cc-text-secondary tracking-wider">Aetherium</div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-xs font-bold text-cc-text-muted uppercase tracking-wider mb-3">Items &amp; Cosmetics</h3>
                {inventory.items.length === 0 ? (
                  <div className="text-sm text-cc-text-secondary italic text-center py-4 bg-cc-bg-sidebar/30 rounded-lg border border-cc-border border-dashed">
                    No items in inventory.
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {inventory.items.map(item => (
                      <button
                        key={item.id}
                        onClick={() => toggleEquip(item.id, item.equipped)}
                        disabled={pendingItemId === item.id}
                        aria-label={`${item.shopItem.name}${item.equipped ? ' (equipped)' : ''}`}
                        className={`aspect-square rounded-lg border flex items-center justify-center relative group transition-colors disabled:opacity-50 ${
                          item.equipped ? 'bg-indigo-900/50 border-indigo-500' : 'bg-cc-bg-sidebar border-cc-border'
                        }`}
                      >
                        <span className="text-2xl">{COSMETIC_ICONS[item.shopItem.type] ?? '📦'}</span>
                        {item.equipped && (
                          <span className="absolute top-1 right-1 bg-indigo-500 rounded-full p-0.5">
                            <Check size={10} className="text-white" />
                          </span>
                        )}
                        <div className="absolute hidden group-hover:block bottom-full mb-2 bg-cc-bg-sidebar text-xs text-cc-text-primary p-2 rounded shadow-lg whitespace-nowrap z-10">
                          {item.shopItem.name} {item.equipped ? '(equipped)' : ''}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-red-400">
              Failed to load inventory.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
