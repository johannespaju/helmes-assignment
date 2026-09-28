import { test as base } from '@playwright/test';

import { SectorDto } from '../src/app/api/api.models';
import { FakeApi } from './fake-api';

export { expect } from '@playwright/test';

export const sectors: SectorDto[] = [
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    children: [
      {
        id: 'food-and-beverage',
        name: 'Food and beverage',
        children: [
          { id: 'bakery', name: 'Bakery & confectionery products', children: [] },
          { id: 'beverages', name: 'Beverages', children: [] },
        ],
      },
    ],
  },
  {
    id: 'service',
    name: 'Service',
    children: [
      { id: 'tourism', name: 'Tourism', children: [] },
      { id: 'translation', name: 'Translation services', children: [] },
    ],
  },
];

export const test = base.extend<{ api: FakeApi }>({
  api: [
    async ({ context }, use) => {
      const api = new FakeApi(sectors);
      await api.install(context);
      await use(api);
    },
    { auto: true },
  ],
});
