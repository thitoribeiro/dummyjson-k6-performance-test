"use strict";
// src/scenarios/products/search-products.ts
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
const AUTHORIZATION = __ENV.AUTHORIZATION || '';
// === Custom Metrics ===
const searchDuration = new metrics_1.Trend('search_products_duration');
const searchSuccess = new metrics_1.Counter('search_products_success');
const searchFailure = new metrics_1.Counter('search_products_failure');
const searchFailureRate = new metrics_1.Rate('search_products_failure_rate');
// === Load Parameters ===
const RATE = Number(__ENV.RATE) || 1;
const TIME_UNIT = __ENV.TIME_UNIT || '1s';
const DURATION = __ENV.DURATION || '5s';
const PRE_ALLOCATED_VUS = Number(__ENV.PRE_ALLOCATED_VUS) || 10;
const MAX_VUS = Number(__ENV.MAX_VUS) || 50;
exports.options = {
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
function default_1() {
    const url = `${BASE_URL}/products/search?q=phone`;
    const params = {
        headers: AUTHORIZATION ? { Authorization: AUTHORIZATION } : undefined,
    };
    (0, k6_1.group)('Search Products - Valid Term', () => {
        var _a, _b;
        const start = Date.now();
        const res = http_1.default.get(url, params);
        const duration = Date.now() - start;
        searchDuration.add(duration);
        const body = res.json();
        const success = (0, k6_1.check)(res, {
            'status is 200': (r) => r.status === 200,
            'response body is valid JSON': () => body !== null,
            'products list has items': () => { var _a, _b; return ((_b = (_a = body === null || body === void 0 ? void 0 : body.products) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) > 0; },
            'total field > 0': () => { var _a; return ((_a = body === null || body === void 0 ? void 0 : body.total) !== null && _a !== void 0 ? _a : 0) > 0; },
            'products have id, title, category': () => { var _a, _b; return (_b = (_a = body === null || body === void 0 ? void 0 : body.products) === null || _a === void 0 ? void 0 : _a.every((p) => p.id && p.title && p.category)) !== null && _b !== void 0 ? _b : false; },
        });
        if (success) {
            searchSuccess.add(1);
            console.log(`[SUCCESS] ${res.status} - ${(_b = (_a = body === null || body === void 0 ? void 0 : body.products) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0} items found.`);
        }
        else {
            searchFailure.add(1);
            searchFailureRate.add(true);
            console.error(`[FAILURE] ${res.status} - ${res.body}`);
        }
    });
}
