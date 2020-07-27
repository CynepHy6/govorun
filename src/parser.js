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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildResponse = void 0;
const server_1 = require("./server");
const utils_1 = require("./utils");
const moment_1 = __importDefault(require("moment"));
const STUDENT = '\\s*(у|лк|student_id=|people\\/)\\s*\\-?\\.?\\s*';
const TEACHER = '\\s*(teacher_id=|п)\\s*';
const GROUP = '(\\s*г(рупп.?|р)?\\.?\\s*)';
const EXCLUDED = '\\d{4}[.-]\\d{1,2}[.-]\\d{1,2}'
    + '|\\d{1,2}[.-]\\d{1,2}[.-]\\d{4}'
    + '|tickets\\/\\d+'
    + '|details\\/\\d+'
    + '|thread_ts=\\d+[.]\\d+'
    + '|(\\d+[+@-])+\\d*|[+@-]\\d+'
    + '|pageId=.*?\\d+'
    + '|\\d{10,}'
    + '|(=?\\d+)([_])'
    + '|\\d+[*]+\\d*'
    + '|\\d{4}\\s*[р₽][\\s.]?';
const RE_STUDENT = new RegExp(STUDENT + '\\d{5,9}', 'gi');
const RE_CLEAN_STUDENT = new RegExp(STUDENT, 'gi');
const RE_TEACHER = new RegExp(TEACHER + '\\d{5,9}', 'gi');
const RE_CLEAN_TEACHER = new RegExp(TEACHER, 'gi');
const RE_GROUP = new RegExp('\\b\\d{4}\\b', 'giu');
const RE_CLEAN_GROUP = new RegExp(GROUP, 'gi');
const RE_COMMON = new RegExp('\\b\\d{5,9}\\b', 'gi');
const RE_EXCLUDED = new RegExp(EXCLUDED, 'gi');
const SPECIAL = {
    '10148852': '<@UJAGQRJM8>',
    '1832(.|[\\s\\S])*ст.па|ст.па(.|[\\s\\S])*1832': '<@UJAGQRJM8>',
};
const SPECIAL_KEYS = Object.keys(SPECIAL);
const kglLink = 'https://grouplessons-api.skyeng.ru/admin/student/view/';
const idLink = 'https://id.skyeng.ru/admin/users/';
const customerLink = 'https://fly.customer.io/env/40281/people/';
const crm1GroupLink = 'https://crm.skyeng.ru/admin/group/edit?id=';
let threadTs;
function buildResponse(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!payload.text) {
            return;
        }
        threadTs = payload.thread_ts || '';
        payload = cleanPayloadText(payload);
        console.log(payload);
        const ids = parseIds(payload);
        return ''
            + (yield buildForStudentIds(ids.students))
            + (yield buildForTeacherIds(ids.teachers))
            + (yield buildForGroupIds(ids.groups))
            + (yield buildSpecial(payload));
    });
}
exports.buildResponse = buildResponse;
function parseIds(payload) {
    const ids = {
        students: utils_1.filterRepeated([...getStudentIds(payload), ...getCommonIds(payload)]),
        teachers: utils_1.filterRepeated(getTeacherIds(payload)),
        groups: utils_1.filterRepeated(getGroupIds(payload)),
    };
    ids.students = ids.students.filter(id => ids.teachers.indexOf(id) === -1);
    return ids;
}
function getStudentIds(payload) {
    const sids = payload.text.match(RE_STUDENT) || [];
    return sids.map(sid => sid.replace(RE_CLEAN_STUDENT, ''));
}
function getTeacherIds(payload) {
    const sids = payload.text.match(RE_TEACHER) || [];
    return sids.map(sid => sid.replace(RE_CLEAN_TEACHER, ''));
}
function getCommonIds(payload) {
    return payload.text.match(RE_COMMON) || [];
}
function getGroupIds(payload) {
    const ids = payload.text.match(RE_GROUP) || [];
    return ids.map(id => id.replace(RE_CLEAN_GROUP, ''));
}
function buildForStudentIds(ids) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ids) {
            return;
        }
        const promises = ids.map((id) => __awaiter(this, void 0, void 0, function* () {
            return `${id}: <${kglLink}${id}|KGL> | <${idLink}${id}|ID> | <${customerLink}${id}|customer> `
                + `${yield searchHelpdesk(id)}\n`;
        }));
        return (yield Promise.all(promises)).join('');
    });
}
function buildForTeacherIds(ids) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ids) {
            return;
        }
        return ids.map(id => `${id}:  <${idLink}${id}|ID> \n`).join('');
    });
}
function buildForGroupIds(ids) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ids) {
            return;
        }
        const promises = ids.map((id) => __awaiter(this, void 0, void 0, function* () { return `<${crm1GroupLink}${id}|группа ${id}> ${yield searchZameny(id)}\n`; }));
        return (yield Promise.all(promises)).join('');
    });
}
function cleanPayloadText(payload) {
    payload.text = payload.text.replace(RE_EXCLUDED, '');
    return payload;
}
function buildSpecial(payload) {
    const specials = SPECIAL_KEYS.map(key => {
        const reKey = new RegExp(key, 'gim');
        return reKey.test(payload.text) ? `${SPECIAL[key]} fyi` : false;
    }).filter(it => it);
    return utils_1.filterRepeated(specials).join(', ');
}
function searchHelpdesk(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const messages = yield server_1.search(`${id} in:#kids-groups-helpdesk -ранее -предыдущие -customer -%3C%40UQ0EUGQVA%3E`);
        const links = messages.filter(m => m.username === 'kids groups helpdesk')
            .filter(m => m.ts !== threadTs)
            .filter(m => !m.previous)
            .map(m => `<${m.permalink}|${utils_1.formatTs(m.ts)}>`);
        if (0 === links.length) {
            return '';
        }
        return `| ранее: ` + links.join(', ');
    });
}
function searchZameny(groupId) {
    return __awaiter(this, void 0, void 0, function* () {
        const after = moment_1.default().subtract(7, 'day').format('YYYY-MM-DD');
        const query = `${groupId} in:#kgl-zameny after:${after}`;
        const messagges = yield server_1.search(query);
        const links = messagges.filter(m => m.ts !== threadTs)
            // .filter(m => {
            //   console.log(m);
            //   return !m.previous;
            // })
            .map(m => `<${m.permalink}|${utils_1.formatTs(m.ts)}>`);
        if (0 === links.length) {
            return '';
        }
        return `| замены: ` + links.join(', ');
    });
}
