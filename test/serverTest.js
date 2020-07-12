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
it('должно распарсить группу', function () {
    return __awaiter(this, void 0, void 0, function* () {
        stubs_1.payload.text = '2222';
        const [result] = yield Promise.all([parser_1.buildResponse(stubs_1.payload)]);
        expect(result).equal('<https://crm.skyeng.ru/admin/group/edit?id=2222|группа 2222> \n');
    });
});
