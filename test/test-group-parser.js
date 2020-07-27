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
const group = (id) => `<https://crm.skyeng.ru/admin/group/edit?id=${id}|группа ${id}> \n`;
describe('упоминание группы', () => {
    it('1234', function () {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            stubs_1.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
            const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
            expect(group(1234)).equal(result);
        });
    });
    it('1234. .1235', function () {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            stubs_1.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
            const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
            expect(group(1234) + group(1235)).equal(result);
        });
    });
    it('1234_ _1235', function () {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            stubs_1.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
            const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
            expect(group(1234) + group(1235)).equal(result);
        });
    });
    it('1111 1234р 1235 Р 1222 ₽', function () {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            stubs_1.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
            const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
            expect(group(1111)).equal(result);
        });
    });
    describe('спец', () => {
        it('1832 степа', function () {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                stubs_1.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
                const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
                expect(group(1832) + '<@UJAGQRJM8> fyi').equal(result);
            });
        });
        it('1832 \n abracadabra степа', function () {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                stubs_1.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
                const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
                expect(group(1832) + '<@UJAGQRJM8> fyi').equal(result);
            });
        });
        it('степа 1832', function () {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                stubs_1.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
                const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
                expect(group(1832) + '<@UJAGQRJM8> fyi').equal(result);
            });
        });
        it('степа \n abracadabra 1832', function () {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                stubs_1.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
                const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
                expect(group(1832) + '<@UJAGQRJM8> fyi').equal(result);
            });
        });
    });
});
