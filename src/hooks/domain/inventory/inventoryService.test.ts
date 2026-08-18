import { apiInstance } from '@/services/instance';

import { InventoryServices } from './inventoryService';

jest.mock('@/services/instance', () => ({
  apiInstance: {
    get: jest.fn(),
  },
}));

const mockedApiInstance = jest.mocked(apiInstance);

describe('InventoryServices localization', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('requests item names in the selected server locale', async () => {
    mockedApiInstance.get.mockReturnValue({
      json: jest.fn().mockResolvedValue([
        {
          default_name: 'Gạo thơm',
          default_note: '',
          expires_at: '2026-08-30',
          id: 1,
          min_quantity: 2,
          name: 'Fragrant rice',
          parent_id: 2,
          quantity: 5,
          resolved_locale: 'en-US',
          translations: {
            'en-US': { name: 'Fragrant rice', note: '' },
          },
          unit: 'kg',
          unit_price: 100,
        },
      ]),
    } as never);

    await InventoryServices.fetchItems('en-US');

    expect(mockedApiInstance.get).toHaveBeenCalledWith('api/items', {
      searchParams: { flat: 1, locale: 'en-US' },
    });
  });

  it('requests alert paths in the selected server locale', async () => {
    mockedApiInstance.get.mockReturnValue({
      json: jest.fn().mockResolvedValue([]),
    } as never);

    await InventoryServices.fetchAlerts(4, 'cs-CZ');

    expect(mockedApiInstance.get).toHaveBeenCalledWith('api/alerts', {
      searchParams: { limit: 4, locale: 'cs-CZ' },
    });
  });
});
