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
console.log = () => { };
const student = (id) => `${id}: <https://grouplessons-api.skyeng.ru/admin/student/view/${id}|KGL>` +
    ` | <https://id.skyeng.ru/admin/users/${id}|ID> | <https://fly.customer.io/env/40281/people/${id}|customer> \n`;
const group = (id) => `<https://crm.skyeng.ru/admin/group/edit?id=${id}|группа ${id}> \n`;
const teacher = (id) => `П ${id}:  <https://id.skyeng.ru/admin/users/${id}|ID> \n`;
describe('упоминание группы', () => {
    it('айди', function () {
        return __awaiter(this, void 0, void 0, function* () {
            stubs_1.payload.text = '1234';
            const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
            expect(group(1234)).equal(result);
        });
    });
    describe('спец', () => {
        it('Г имя', function () {
            return __awaiter(this, void 0, void 0, function* () {
                stubs_1.payload.text = '1734 степа';
                const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
                expect(group(1734) + '<@UJAGQRJM8> fyi').equal(result);
            });
        });
        it('Г \\n имя', function () {
            return __awaiter(this, void 0, void 0, function* () {
                stubs_1.payload.text = '1734 \n abracadabra степа';
                const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
                expect(group(1734) + '<@UJAGQRJM8> fyi').equal(result);
            });
        });
        it('имя Г', function () {
            return __awaiter(this, void 0, void 0, function* () {
                stubs_1.payload.text = 'степа 1734';
                const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
                expect(group(1734) + '<@UJAGQRJM8> fyi').equal(result);
            });
        });
        it('имя \\n Г', function () {
            return __awaiter(this, void 0, void 0, function* () {
                stubs_1.payload.text = 'степа \n abracadabra 1734';
                const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
                expect(group(1734) + '<@UJAGQRJM8> fyi').equal(result);
            });
        });
    });
});
describe('упоминание студента', () => {
    it('айди', function () {
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
    it('У + айди', function () {
        return __awaiter(this, void 0, void 0, function* () {
            stubs_1.payload.text = 'у 12345678 99999999';
            const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
            expect(student(12345678) + student(99999999)).equal(result);
        });
    });
    it('У У + айди', function () {
        return __awaiter(this, void 0, void 0, function* () {
            stubs_1.payload.text = 'у 12345678 12345678 99999999';
            const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
            expect(student(12345678) + student(99999999)).equal(result);
        });
    });
    it('У У + айди + П', function () {
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
});
