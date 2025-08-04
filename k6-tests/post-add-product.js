"use strict";
// src/scenarios/products/post-add-product.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.options = void 0;
exports.default = default_1;
const http_1 = __importDefault(require("k6/http"));
const k6_1 = require("k6");
const metrics_1 = require("k6/metrics");
// === Configuration ===
const BASE_URL = __ENV.BASE_URL || 'https://dummyjson.com';
// === Custom Metrics ===
const addProductDuration = new metrics_1.Trend('add_product_duration');
// === Load Parameters ===
const RATE = Number(__ENV.RATE) || 1;
const TIME_UNIT = __ENV.TIME_UNIT || '1s';
const DURATION = __ENV.DURATION || '5s';
const PRE_ALLOCATED_VUS = Number(__ENV.PRE_ALLOCATED_VUS) || 10;
const MAX_VUS = Number(__ENV.MAX_VUS) || 50;
exports.options = {
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
function default_1() {
    const url = `${BASE_URL}/products/add`;
    const payload = JSON.stringify({
        title: 'BMW Pencil',
    });
    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };
    (0, k6_1.group)('Add Product - Valid Data', () => {
        const start = Date.now();
        const res = http_1.default.post(url, payload, params);
        const duration = Date.now() - start;
        addProductDuration.add(duration);
        const body = res.json();
        (0, k6_1.check)(res, {
            'status is 201': (r) => r.status === 201,
            'product has id and title': () => !!((body === null || body === void 0 ? void 0 : body.id) && (body === null || body === void 0 ? void 0 : body.title) === 'BMW Pencil'),
        });

        if (res.status >= 200 && res.status < 300) {
            console.log(`[SUCCESS] ${res.status}`);
        } else {
            console.error(`[FAILURE] ${res.status} - ${res.body}`);
        }
    });
}
