"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../src/index"));
describe('API Endpoints', () => {
    describe('GET /', () => {
        it('should return welcome message', async () => {
            const response = await (0, supertest_1.default)(index_1.default).get('/');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success');
            expect(response.body).toHaveProperty('message');
        });
    });
    describe('GET /health', () => {
        it('should return health status', async () => {
            const response = await (0, supertest_1.default)(index_1.default).get('/health');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('status');
        });
    });
});
