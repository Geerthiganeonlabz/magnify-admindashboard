import type { InventoryItem } from '@/types/inventory';

/** One inventory item used to make 1 unit of a product (Bill of Materials). */
export interface Material {
  inventoryId: string;
  qty: number;
}

const KEY = 'magnify-product-materials';

function readAll(): Record<string, Material[]> {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, Material[]>) : {};
  } catch {
    return {};
  }
}

export function readMaterials(productKey: string): Material[] {
  return readAll()[productKey] ?? [];
}

export function writeMaterials(productKey: string, list: Material[]): void {
  if (!productKey) return;
  try {
    const all = readAll();
    if (list.length) all[productKey] = list;
    else delete all[productKey];
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch (e) {
    console.error('Could not save product materials.', e);
  }
}

/** Material cost of 1 product = sum(unit value x qty). */
export function materialCost(list: Material[], inventory: InventoryItem[]): number {
  return list.reduce((sum, m) => {
    const item = inventory.find((i) => i.id === m.inventoryId);
    return sum + (item ? item.unitValue * m.qty : 0);
  }, 0);
}

/** How many products can be made right now with the current stock (the scarcest item decides). */
export function producibleUnits(list: Material[], inventory: InventoryItem[]): number {
  const usable = list.filter((m) => m.qty > 0);
  if (!usable.length) return 0;
  return Math.max(
    0,
    Math.min(
      ...usable.map((m) => {
        const item = inventory.find((i) => i.id === m.inventoryId);
        return item ? Math.floor(item.stock / m.qty) : 0;
      })
    )
  );
}

/** Reduce inventory stock for `units` products made/sold. Returns the updated inventory. */
export function consumeMaterials(list: Material[], units: number, inventory: InventoryItem[]): InventoryItem[] {
  return inventory.map((item) => {
    const m = list.find((x) => x.inventoryId === item.id);
    return m ? { ...item, stock: Math.max(0, item.stock - m.qty * units) } : item;
  });
}
