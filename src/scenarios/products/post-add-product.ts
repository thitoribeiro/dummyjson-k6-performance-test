// src/scenarios/products/post-add-product.ts

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
const addProductDuration = new Trend('add_product_duration');

// === Load Parameters ===
const RATE = Number(__ENV.RATE) || 1;
const TIME_UNIT = __ENV.TIME_UNIT || '1s';
const DURATION = __ENV.DURATION || '5s';
const PRE_ALLOCATED_VUS = Number(__ENV.PRE_ALLOCATED_VUS) || 10;
const MAX_VUS = Number(__ENV.MAX_VUS) || 50;

export const options = {
  scenarios: {
    add_product_load: {
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
  const url = `${BASE_URL}/products/add`;
  const payload = JSON.stringify({
    title: 'BMW Pencil',
  });
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  group('Add Product - Valid Data', () => {
    const start = Date.now();
    const res = http.post(url, payload, params);
    const duration = Date.now() - start;

    addProductDuration.add(duration);

    const body = res.json() as Product | null;

    check(res, {
      'status is 201': (r) => r.status === 201,
      'product has id and title': () => !!(body?.id && body?.title === 'BMW Pencil'),
    });
  });
}
