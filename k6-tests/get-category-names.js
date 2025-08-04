"use strict";
// src/scenarios/products/get-category-names.ts
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
const categoryNamesDuration = new metrics_1.Trend('category_names_duration');
// === Load Parameters ===
const RATE = Number(__ENV.RATE) || 1;
const TIME_UNIT = __ENV.TIME_UNIT || '1s';
const DURATION = __ENV.DURATION || '5s';
const PRE_ALLOCATED_VUS = Number(__ENV.PRE_ALLOCATED_VUS) || 10;
const MAX_VUS = Number(__ENV.MAX_VUS) || 50;
exports.options = {
    scenarios: {
        category_names_load: {
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
    const url = `${BASE_URL}/products/category-list`;
    (0, k6_1.group)('List Category - Names', () => {
        const start = Date.now();
        const res = http_1.default.get(url);
        const duration = Date.now() - start;
        categoryNamesDuration.add(duration);
        const body = res.json();
        (0, k6_1.check)(res, {
            'status is 200': (r) => r.status === 200,
            'response is an array of strings': () => { var _a; return (_a = (Array.isArray(body) && (body === null || body === void 0 ? void 0 : body.every((c) => typeof c === 'string')))) !== null && _a !== void 0 ? _a : false; },
        });
    });
}
