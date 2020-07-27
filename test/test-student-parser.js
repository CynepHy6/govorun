"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const stubs_1 = require("./stubs");
const parser_1 = require("../src/parser");
const expect = require('chai').expect;
console.log = () => { };
const student = (id) => `${id}: <https://grouplessons-api.skyeng.ru/admin/student/view/${id}|KGL>` +
    ` | <https://id.skyeng.ru/admin/users/${id}|ID> | <https://fly.customer.io/env/40281/people/${id}|customer> \n`;
const teacher = (id) => `${id}:  <https://id.skyeng.ru/admin/users/${id}|ID> \n`;
describe('упоминание студента', () => {
    it('12345678', function () {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            stubs_1.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
            const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
            expect(student(12345678)).equal(result);
        });
    });
    it('у12345678', function () {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            stubs_1.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
            const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
            expect(student(12345678)).equal(result);
        });
    });
    it('лк12345678', function () {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            stubs_1.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
            const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
            expect(student(12345678)).equal(result);
        });
    });
    it('у12345678 99999999', function () {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            stubs_1.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
            const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
            expect(student(12345678) + student(99999999)).equal(result);
        });
    });
    it('у12345678 12345678 99999999', function () {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            stubs_1.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
            const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
            expect(student(12345678) + student(99999999)).equal(result);
        });
    });
    it('у 12345678 П 12345678 99999999', function () {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            stubs_1.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
            const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
            expect(student(99999999) + teacher(12345678)).equal(result);
        });
    });
    it('спец 10148852 добавляет тег', function () {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            stubs_1.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
            const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
            expect(student(10148852) + '<@UJAGQRJM8> fyi').equal(result);
        });
    });
    it('12345678 123-123456 123123-123456-123456 123123-123456-', function () {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            stubs_1.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
            const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
            expect(student(12345678)).equal(result);
        });
    });
    it('12345678 p1594304604116600?thread_ts=1594303884.114500', function () {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            stubs_1.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
            const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
            expect(student(12345678)).equal(result);
        });
    });
    it('12345678 1234566@mail.ru', function () {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            stubs_1.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
            const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
            expect(student(12345678)).equal(result);
        });
    });
    it('12345678 pageId=777777', function () {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            stubs_1.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
            const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
            expect(student(12345678)).equal(result);
        });
    });
    it('У 1234567 У 12345678912', function () {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            stubs_1.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
            const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
            expect(student(1234567)).equal(result);
        });
    });
    it('.1234567 1234568.', function () {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            stubs_1.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
            const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
            expect(student(1234567) + student(1234568)).equal(result);
        });
    });
    it('1234567 123456**1234', function () {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            stubs_1.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
            const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
            expect(student(1234567)).equal(result);
        });
    });
});
