// src/scenarios/products/get-products-sort-desc.ts

import http from 'k6/http';
import { check, group } from 'k6';
import { Trend } from 'k6/metrics';

// === Interfaces ===
interface Product {
  id: number;
  title: string;
}

interface SearchResponse {
  products: Product[];
}

// === Configuration ===
const BASE_URL = __ENV.BASE_URL || 'https://dummyjson.com';

// === Custom Metrics ===
const sortDescDuration = new Trend('sort_desc_duration');

// === Load Parameters ===
const RATE = Number(__ENV.RATE) || 1;
const TIME_UNIT = __ENV.TIME_UNIT || '1s';
const DURATION = __ENV.DURATION || '5s';
const PRE_ALLOCATED_VUS = Number(__ENV.PRE_ALLOCATED_VUS) || 10;
const MAX_VUS = Number(__ENV.MAX_VUS) || 50;

export const options = {
  scenarios: {
    sort_desc_load: {
      executor: 'constant-arrival-rate',
      rate: RATE,
      timeUnit: TIME_UNIT,
      duration: DURATION,
      preAllocatedVUs: PRE_ALLOCATED_VUS,
      maxVUs: MAX_VUS,
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1200'],
  },
};

export default function () {
  const url = `${BASE_URL}/products?sortBy=title&order=desc`;

  group('Sort Products - Descending', () => {
    const start = Date.now();
    const res = http.get(url);
    const duration = Date.now() - start;

    sortDescDuration.add(duration);

    const body = res.json() as SearchResponse | null;

    check(res, {
      'status is 200': (r) => r.status === 200,
      'products are sorted alphabetically (Z-A)': () => {
        if (!body?.products) return false;
        for (let i = 0; i < body.products.length - 1; i++) {
          if (body.products[i].title.localeCompare(body.products[i + 1].title) < 0) {
            return false;
          }
        }
        return true;
      },
    });
  });
}
