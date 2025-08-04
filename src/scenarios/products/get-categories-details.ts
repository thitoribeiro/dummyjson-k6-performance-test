// src/scenarios/products/get-categories-details.ts

import http from 'k6/http';
import { check, group } from 'k6';
import { Trend } from 'k6/metrics';

// === Interfaces ===
interface Category {
  slug: string;
  name: string;
  url: string;
}

// === Configuration ===
const BASE_URL = __ENV.BASE_URL || 'https://dummyjson.com';

// === Custom Metrics ===
const categoriesDetailsDuration = new Trend('categories_details_duration');

// === Load Parameters ===
const RATE = Number(__ENV.RATE) || 1;
const TIME_UNIT = __ENV.TIME_UNIT || '1s';
const DURATION = __ENV.DURATION || '5s';
const PRE_ALLOCATED_VUS = Number(__ENV.PRE_ALLOCATED_VUS) || 10;
const MAX_VUS = Number(__ENV.MAX_VUS) || 50;

export const options = {
  scenarios: {
    categories_details_load: {
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
  const url = `${BASE_URL}/products/categories`;

  group('List Categories - Details', () => {
    const start = Date.now();
    const res = http.get(url);
    const duration = Date.now() - start;

    categoriesDetailsDuration.add(duration);

    const body = res.json() as Category[] | null;

    check(res, {
      'status is 200': (r) => r.status === 200,
      'categories have slug, name, url': () =>
        body?.every((c: Category) => c.slug && c.name && c.url) ?? false,
    });
  });
}
