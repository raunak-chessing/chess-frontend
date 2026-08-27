import React, { useEffect, useState } from 'react';
import { shopApi } from '../../api/shopApi';
import { inventoryApi, type ShopItem, type PlayerInventory } from '@/features/inventory/api/inventoryApi';
import { X, Coins, Sparkles, Store } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from 'react-hot-toast';

interface ShopModalProps {
  onClose: () => void;
}

export function ShopModal({ onClose }: ShopModalProps) {
  const [catalog, setCatalog] = useState<ShopItem[] | null>(null);
  const [inventory, setInventory] = useState<PlayerInventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([shopApi.getCatalog(), inventoryApi.getMyInventory()])
      .then(([catalogData, inventoryData]) => {
        setCatalog(catalogData);
        setInventory(inventoryData);
      })
      .finally(() => setLoading(false));
  }, []);

  const ownedShopItemIds = new Set(inventory?.items.map((item) => item.shopItemId) ?? []);

  const handlePurchase = async (item: ShopItem) => {
    setPurchasingId(item.id);
    try {
      await shopApi.purchase(item.id);
      const refreshed = await inventoryApi.getMyInventory();
      setInventory(refreshed);
      toast.success(`Purchased ${item.name}!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Purchase failed');
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Store className="text-indigo-400" size={20} /> Shop
          </h2>
          <div className="flex items-center gap-4">
            {inventory && (
              <div className="flex items-center gap-3 text-sm font-mono">
                <span className="flex items-center gap-1 text-amber-400">
                  <Coins size={14} /> {inventory.gold.toLocaleString()}
                </span>
                <span className="flex items-center gap-1 text-purple-400">
                  <Sparkles size={14} /> {inventory.aetherium.toLocaleString()}
                </span>
              </div>
            )}
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-700 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : catalog && catalog.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {catalog.map((item) => {
                const owned = ownedShopItemIds.has(item.id);
                const purchasing = purchasingId === item.id;
                return (
                  <div key={item.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{item.type.replace('_', ' ')}</span>
                      <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">{item.rarity}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-100">{item.name}</span>
                    <span className="text-xs text-slate-400 flex-1">{item.description}</span>
                    {owned ? (
                      <div className="text-center text-xs font-bold text-emerald-400 py-1.5">Owned</div>
                    ) : (
                      <button
                        onClick={() => handlePurchase(item)}
                        disabled={purchasing}
                        className="mt-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        {purchasing ? (
                          <Spinner />
                        ) : item.priceGold ? (
                          <>
                            <Coins size={12} /> {item.priceGold.toLocaleString()}
                          </>
                        ) : (
                          <>
                            <Sparkles size={12} /> {item.priceAetherium?.toLocaleString()}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">The shop is empty right now.</div>
          )}
        </div>
      </div>
    </div>
  );
}
