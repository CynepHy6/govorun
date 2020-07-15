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
const stubs_1 = require("../src/stubs");
const parser_1 = require("../src/parser");
const expect = require('chai').expect;
const log = console.log;
console.log = () => { };
const student = (id) => `${id}: <https://grouplessons-api.skyeng.ru/admin/student/view/${id}|KGL>` +
    ` | <https://id.skyeng.ru/admin/users/${id}|ID> | <https://fly.customer.io/env/40281/people/${id}|customer> \n`;
const teacher = (id) => `${id}:  <https://id.skyeng.ru/admin/users/${id}|ID> \n`;
describe('упоминание студента', () => {
    it('#', function () {
        return __awaiter(this, void 0, void 0, function* () {
            stubs_1.payload.text = '12345678';
            const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
            expect(student(12345678)).equal(result);
        });
    });
    it('У', function () {
        return __awaiter(this, void 0, void 0, function* () {
            stubs_1.payload.text = 'у12345678';
            const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
            expect(student(12345678)).equal(result);
        });
    });
    it('ЛК', function () {
        return __awaiter(this, void 0, void 0, function* () {
            stubs_1.payload.text = 'лк 12345678';
            const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
            expect(student(12345678)).equal(result);
        });
    });
    it('У + #', function () {
        return __awaiter(this, void 0, void 0, function* () {
            stubs_1.payload.text = 'у 12345678 99999999';
            const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
            expect(student(12345678) + student(99999999)).equal(result);
        });
    });
    it('У У + #', function () {
        return __awaiter(this, void 0, void 0, function* () {
            stubs_1.payload.text = 'у 12345678 12345678 99999999';
            const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
            expect(student(12345678) + student(99999999)).equal(result);
        });
    });
    it('У У + # + П', function () {
        return __awaiter(this, void 0, void 0, function* () {
            stubs_1.payload.text = 'у 12345678 П 12345678 99999999';
            const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
            expect(student(99999999) + teacher(12345678)).equal(result);
        });
    });
    it('спец У добавляет тег', function () {
        return __awaiter(this, void 0, void 0, function* () {
            stubs_1.payload.text = '10148852';
            const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
            expect(student(10148852) + '<@UJAGQRJM8> fyi').equal(result);
        });
    });
    it('У + -#', function () {
        return __awaiter(this, void 0, void 0, function* () {
            stubs_1.payload.text = '12345678 123-123456 123123-123456-123456 123123-123456-';
            const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
            log(result);
            expect(student(12345678)).equal(result);
        });
    });
    it('У + .#', function () {
        return __awaiter(this, void 0, void 0, function* () {
            stubs_1.payload.text = '12345678 p1594304604116600?thread_ts=1594303884.114500';
            const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
            log(result);
            expect(student(12345678)).equal(result);
        });
    });
    it('У + @#', function () {
        return __awaiter(this, void 0, void 0, function* () {
            stubs_1.payload.text = '12345678 1234566@mail.ru';
            const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
            log(result);
            expect(student(12345678)).equal(result);
        });
    });
});
