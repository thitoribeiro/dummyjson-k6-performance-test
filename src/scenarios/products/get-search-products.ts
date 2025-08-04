// src/scenarios/products/get-search-products.ts

import http from 'k6/http';
import { check, group } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';

// === Interfaces ===
interface Product {
  id: number;
  title: string;
  category: string;
}

interface SearchResponse {
  products: Product[];
  total: number;
}

// === Configuration ===
const BASE_URL = __ENV.BASE_URL || 'https://dummyjson.com';
const AUTHORIZATION = __ENV.AUTHORIZATION || '';

// === Custom Metrics ===
const searchDuration = new Trend('search_products_duration');
const searchSuccess = new Counter('search_products_success');
const searchFailure = new Counter('search_products_failure');
const searchFailureRate = new Rate('search_products_failure_rate');

// === Load Parameters ===
const RATE = Number(__ENV.RATE) || 1;
const TIME_UNIT = __ENV.TIME_UNIT || '1s';
const DURATION = __ENV.DURATION || '5s';
const PRE_ALLOCATED_VUS = Number(__ENV.PRE_ALLOCATED_VUS) || 10;
const MAX_VUS = Number(__ENV.MAX_VUS) || 50;

export const options = {
  scenarios: {
    search_products_load: {
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
    search_products_failure_rate: ['rate<0.05'],
    search_products_duration: ['p(90)<1000'],
  },
};

export default function () {
  const url = `${BASE_URL}/products/search?q=phone`;
  const params = {
    headers: AUTHORIZATION ? { Authorization: AUTHORIZATION } : undefined,
  };

  group('Search Products - Valid Term', () => {
    const start = Date.now();
    const res = http.get(url, params);
    const duration = Date.now() - start;

    searchDuration.add(duration);

    const body = res.json() as SearchResponse | null;

    const success = check(res, {
      'status is 200': (r) => r.status === 200,
      'response body is valid JSON': () => body !== null,
      'products list has items': () => (body?.products?.length ?? 0) > 0,
      'total field > 0': () => (body?.total ?? 0) > 0,
      'products have id, title, category': () =>
        body?.products?.every((p: Product) => p.id && p.title && p.category) ?? false,
    });

    if (success) {
      searchSuccess.add(1);
      console.log(`[SUCCESS] ${res.status} - ${body?.products?.length ?? 0} items found.`);
    } else {
      searchFailure.add(1);
      searchFailureRate.add(true);
      console.error(`[FAILURE] ${res.status} - ${res.body}`);
    }
  });
}
