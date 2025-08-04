// src/scenarios/products/put-update-product.ts

import http from 'k6/http';
import { check, group } from 'k6';
import { Trend } from 'k6/metrics';

// === Interfaces ===
interface Product {
  id: number;
  title: string;
}

// === Configuration ===
const BASE_URL = __ENV.BASE_URL || 'https://dummyjson.com';

// === Custom Metrics ===
const updateProductDuration = new Trend('update_product_duration');

// === Load Parameters ===
const RATE = Number(__ENV.RATE) || 1;
const TIME_UNIT = __ENV.TIME_UNIT || '1s';
const DURATION = __ENV.DURATION || '5s';
const PRE_ALLOCATED_VUS = Number(__ENV.PRE_ALLOCATED_VUS) || 10;
const MAX_VUS = Number(__ENV.MAX_VUS) || 50;

export const options = {
  scenarios: {
    update_product_load: {
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
  const url = `${BASE_URL}/products/1`;
  const payload = JSON.stringify({
    title: 'iPhone Galaxy +1',
  });
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  group('Update Product - Valid Data', () => {
    const start = Date.now();
    const res = http.put(url, payload, params);
    const duration = Date.now() - start;

    updateProductDuration.add(duration);

    const body = res.json() as Product | null;

    check(res, {
      'status is 200': (r) => r.status === 200,
      'product title is updated': () => body?.title === 'iPhone Galaxy +1',
    });
  });
}
