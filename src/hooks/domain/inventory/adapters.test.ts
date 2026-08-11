/* eslint-disable unicorn/no-null -- API fields are explicitly nullable. */
import type { ServerAlert, ServerItem, ServerItemDetail } from './schema';

import {
  toAlertDetails,
  toAlertItem,
  toAlertTotals,
  toIngredientItems,
  toItemDetail,
  toLeafInventoryItems,
} from './adapters';

const ITEM: ServerItem = {
  expires_at: null,
  id: 1,
  min_quantity: 2,
  name: 'Hành lá',
  parent_id: null,
  quantity: 0,
  unit: 'kg',
  unit_price: 10_000,
};

const ALERT: ServerAlert = {
  date: '11/08/2026',
  full_name: 'Rau củ / Hành lá',
  id: 1,
  kind: 'low_stock',
  label: 'Sắp hết (0 kg)',
  min_quantity: 2,
  name: 'Hành lá',
  quantity: 0,
  unit: 'kg',
  updated_at: '2026-08-11 10:00:00',
};

describe('inventory status adapters', () => {
  it('maps zero quantity to out of stock across inventory views', () => {
    expect(toLeafInventoryItems([ITEM])[0]).toMatchObject({
      isLow: true,
      status: 'out',
    });
    expect(toIngredientItems([ITEM])[0]).toMatchObject({
      isLow: true,
      status: 'out',
    });
    expect(
      toItemDetail({ ...ITEM, note: '' } satisfies ServerItemDetail, 'Hành lá'),
    ).toMatchObject({ status: 'out' });
  });

  it('keeps positive quantity below the minimum as low stock', () => {
    const lowItem = { ...ITEM, quantity: 1 };

    expect(toLeafInventoryItems([lowItem])[0]).toMatchObject({
      isLow: true,
      status: 'low',
    });
  });

  it('separates zero-quantity alerts from low-stock alerts', () => {
    expect(toAlertItem(ALERT).severity).toBe('out');
    expect(toAlertDetails([ALERT])[0].severity).toBe('out');
    expect(toAlertTotals([ALERT])).toEqual({ expiring: 0, low: 0, out: 1 });
  });
});
