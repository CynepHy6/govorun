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
define("src/models", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("src/server", ["require", "exports", "src/parser"], function (require, exports, parser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.search = void 0;
    const env = require('dotenv');
    const { createEventAdapter } = require('@slack/events-api');
    const { WebClient } = require('@slack/web-api');
    // const express = require('express');
    // const app = express();
    // app.use(express.json())
    // app.post('/', function (req, res) {
    //   res.send(req.body.challenge);
    // });
    //
    // app.listen(80);
    env.config({ path: '../.env' });
    const secret = process.env.SLACK_SIGNING_SECRET || '';
    const botToken = process.env.SLACK_BOT_TOKEN || '';
    const userToken = process.env.SLACK_USER_TOKEN || '';
    const slackEvent = createEventAdapter(secret);
    const slackBotClient = new WebClient(botToken);
    const slackUserClient = new WebClient(userToken);
    slackEvent.on('message', (payload) => __awaiter(void 0, void 0, void 0, function* () {
        if (payload.thread_ts) {
            return;
        }
        const text = yield parser_1.buildResponse(payload);
        yield postMessage(payload, text);
    }));
    slackEvent.on('app_mention', (payload) => __awaiter(void 0, void 0, void 0, function* () {
        if (!payload.thread_ts) {
            return;
        }
        const text = yield parser_1.buildResponse(payload);
        yield postMessage(payload, text);
    }));
    (() => __awaiter(void 0, void 0, void 0, function* () {
        const server = yield slackEvent.start(process.env.PORT || 3000);
        console.log(`Listening on ${server.address().port}`);
    }))();
    // TODO унести из сервера?
    function postMessage(payload, text) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!text) {
                return;
            }
            const result = yield slackBotClient.chat.postMessage({
                channel: payload.channel,
                thread_ts: payload.thread_ts || payload.ts,
                text: text,
                unfurl_links: true,
            });
            console.log(result);
        });
    }
    function search(query) {
        return __awaiter(this, void 0, void 0, function* () {
            // проверка на userToken тут, чтобы юнит-тесты работали
            const result = userToken && (yield slackUserClient.search.messages({
                query: query,
                sort: 'timestamp',
                count: 60,
            }));
            if (!result.ok) {
                return [];
            }
            return result.messages.matches || [];
        });
    }
    exports.search = search;
});
define("src/utils", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.filterRepeated = exports.formatTs = void 0;
    const formatter = new Intl.DateTimeFormat('ru', {
        timeZone: 'Europe/Moscow',
        hour12: false,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    });
    function formatTs(ts) {
        return formatter.format(new Date(+ts * 1000));
    }
    exports.formatTs = formatTs;
    function filterRepeated(arr) {
        return [...new Set(arr)];
    }
    exports.filterRepeated = filterRepeated;
});
define("src/parser", ["require", "exports", "src/server", "src/utils", "moment"], function (require, exports, server_1, utils_1, moment_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildResponse = void 0;
    moment_1 = __importDefault(moment_1);
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
        + '|\\d{4}\\s*[р₽][\\s.]?'
        + '|\\/\\d+#';
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
        '2348(.|[\\s\\S])*ст.па|ст.па(.|[\\s\\S])*2348': '<@UJAGQRJM8>',
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
});
define("test/testUtils", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.groupTemplate = exports.teacherTemplate = exports.studentTemplate = exports.MENTION = exports.payload = void 0;
    exports.payload = {
        client_msg_id: '',
        type: '',
        text: '',
        user: '',
        ts: '',
        thread_ts: '',
        team: '',
        blocks: [
            {
                type: '',
                block_id: '',
                elements: [],
            },
        ],
        channel: '',
        event_ts: '',
        channel_type: '',
    };
    exports.MENTION = '<@UJAGQRJM8> fyi';
    exports.studentTemplate = (id) => `${id}: <https://grouplessons-api.skyeng.ru/admin/student/view/${id}|KGL>` +
        ` | <https://id.skyeng.ru/admin/users/${id}|ID> | <https://fly.customer.io/env/40281/people/${id}|customer> \n`;
    exports.teacherTemplate = (id) => `${id}:  <https://id.skyeng.ru/admin/users/${id}|ID> \n`;
    exports.groupTemplate = (id) => `<https://crm.skyeng.ru/admin/group/edit?id=${id}|группа ${id}> \n`;
});
define("test/test-group-parser", ["require", "exports", "src/parser", "test/testUtils"], function (require, exports, parser_2, testUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const expect = require('chai').expect;
    console.log = () => { };
    describe('группа', () => {
        it('1234', function () {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                testUtils_1.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
                const [result] = yield Promise.all([parser_2.buildResponse(testUtils_1.payload)]);
                expect(testUtils_1.groupTemplate(1234)).equal(result);
            });
        });
        it('1234. .1235', function () {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                testUtils_1.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
                const [result] = yield Promise.all([parser_2.buildResponse(testUtils_1.payload)]);
                expect(testUtils_1.groupTemplate(1234) + testUtils_1.groupTemplate(1235)).equal(result);
            });
        });
        it('1111 1234р 1235 Р 1222 ₽', function () {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                testUtils_1.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
                const [result] = yield Promise.all([parser_2.buildResponse(testUtils_1.payload)]);
                expect(testUtils_1.groupTemplate(1111)).equal(result);
            });
        });
        describe('спец', () => {
            it('2348 степа', function () {
                var _a;
                return __awaiter(this, void 0, void 0, function* () {
                    testUtils_1.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
                    const [result] = yield Promise.all([parser_2.buildResponse(testUtils_1.payload)]);
                    expect(testUtils_1.groupTemplate(2348) + testUtils_1.specMention).equal(result);
                });
            });
            it('2348 \n abracadabra степа', function () {
                var _a;
                return __awaiter(this, void 0, void 0, function* () {
                    testUtils_1.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
                    const [result] = yield Promise.all([parser_2.buildResponse(testUtils_1.payload)]);
                    expect(testUtils_1.groupTemplate(2348) + testUtils_1.specMention).equal(result);
                });
            });
            it('степа 2348', function () {
                var _a;
                return __awaiter(this, void 0, void 0, function* () {
                    testUtils_1.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
                    const [result] = yield Promise.all([parser_2.buildResponse(testUtils_1.payload)]);
                    expect(testUtils_1.groupTemplate(2348) + testUtils_1.specMention).equal(result);
                });
            });
            it('степа \n abracadabra 2348', function () {
                var _a;
                return __awaiter(this, void 0, void 0, function* () {
                    testUtils_1.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
                    const [result] = yield Promise.all([parser_2.buildResponse(testUtils_1.payload)]);
                    expect(testUtils_1.groupTemplate(2348) + testUtils_1.specMention).equal(result);
                });
            });
        });
    });
});
define("test/test-student-parser", ["require", "exports", "test/testUtils", "src/parser"], function (require, exports, testUtils_2, parser_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const expect = require('chai').expect;
    console.log = () => { };
    describe('студент или учитель', () => {
        it('12345678', function () {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                testUtils_2.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
                const [result] = yield Promise.all([parser_3.buildResponse(testUtils_2.payload)]);
                expect(testUtils_2.studentTemplate(12345678)).equal(result);
            });
        });
        it('у12345678', function () {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                testUtils_2.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
                const [result] = yield Promise.all([parser_3.buildResponse(testUtils_2.payload)]);
                expect(testUtils_2.studentTemplate(12345678)).equal(result);
            });
        });
        it('лк12345678', function () {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                testUtils_2.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
                const [result] = yield Promise.all([parser_3.buildResponse(testUtils_2.payload)]);
                expect(testUtils_2.studentTemplate(12345678)).equal(result);
            });
        });
        it('у12345678 99999999', function () {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                testUtils_2.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
                const [result] = yield Promise.all([parser_3.buildResponse(testUtils_2.payload)]);
                expect(testUtils_2.studentTemplate(12345678) + testUtils_2.studentTemplate(99999999)).equal(result);
            });
        });
        it('у12345678 12345678 99999999', function () {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                testUtils_2.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
                const [result] = yield Promise.all([parser_3.buildResponse(testUtils_2.payload)]);
                expect(testUtils_2.studentTemplate(12345678) + testUtils_2.studentTemplate(99999999)).equal(result);
            });
        });
        it('у 12345678 П 12345678 99999999', function () {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                testUtils_2.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
                const [result] = yield Promise.all([parser_3.buildResponse(testUtils_2.payload)]);
                expect(testUtils_2.studentTemplate(99999999) + testUtils_2.teacherTemplate(12345678)).equal(result);
            });
        });
        it('спец 10148852 добавляет тег', function () {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                testUtils_2.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
                const [result] = yield Promise.all([parser_3.buildResponse(testUtils_2.payload)]);
                expect(testUtils_2.studentTemplate(10148852) + '<@UJAGQRJM8> fyi').equal(result);
            });
        });
        it('12345678 123-123456 123123-123456-123456 123123-123456-', function () {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                testUtils_2.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
                const [result] = yield Promise.all([parser_3.buildResponse(testUtils_2.payload)]);
                expect(testUtils_2.studentTemplate(12345678)).equal(result);
            });
        });
        it('12345678 p1594304604116600?thread_ts=1594303884.114500', function () {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                testUtils_2.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
                const [result] = yield Promise.all([parser_3.buildResponse(testUtils_2.payload)]);
                expect(testUtils_2.studentTemplate(12345678)).equal(result);
            });
        });
        it('12345678 1234566@mail.ru', function () {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                testUtils_2.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
                const [result] = yield Promise.all([parser_3.buildResponse(testUtils_2.payload)]);
                expect(testUtils_2.studentTemplate(12345678)).equal(result);
            });
        });
        it('12345678 pageId=777777', function () {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                testUtils_2.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
                const [result] = yield Promise.all([parser_3.buildResponse(testUtils_2.payload)]);
                expect(testUtils_2.studentTemplate(12345678)).equal(result);
            });
        });
        it('У 1234567 У 12345678912', function () {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                testUtils_2.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
                const [result] = yield Promise.all([parser_3.buildResponse(testUtils_2.payload)]);
                expect(testUtils_2.studentTemplate(1234567)).equal(result);
            });
        });
        it('.1234567 1234568.', function () {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                testUtils_2.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
                const [result] = yield Promise.all([parser_3.buildResponse(testUtils_2.payload)]);
                expect(testUtils_2.studentTemplate(1234567) + testUtils_2.studentTemplate(1234568)).equal(result);
            });
        });
        it('1234567 123456**1234', function () {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                testUtils_2.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
                const [result] = yield Promise.all([parser_3.buildResponse(testUtils_2.payload)]);
                expect(testUtils_2.studentTemplate(1234567)).equal(result);
            });
        });
        it('student_id=1234567&teacher_id=7654321', function () {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                testUtils_2.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
                const [result] = yield Promise.all([parser_3.buildResponse(testUtils_2.payload)]);
                expect(testUtils_2.studentTemplate(1234567) + testUtils_2.teacherTemplate(7654321)).equal(result);
            });
        });
        it('1234567 record/223-592980/189327171#message_id_189327171', function () {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                testUtils_2.payload.text = ((_a = this.test) === null || _a === void 0 ? void 0 : _a.title) || '';
                const [result] = yield Promise.all([parser_3.buildResponse(testUtils_2.payload)]);
                expect(testUtils_2.studentTemplate(1234567)).equal(result);
            });
        });
    });
});
