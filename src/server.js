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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var env = require('dotenv');
var createEventAdapter = require('@slack/events-api').createEventAdapter;
var WebClient = require('@slack/web-api').WebClient;
// const express = require('express');
// const app = express();
// app.use(express.json())
// app.post('/', function (req, res) {
//   res.send(req.body.challenge);
// });
//
// app.listen(80);
env.config({ path: '../.env' });
var secret = process.env.SLACK_SIGNING_SECRET;
var botToken = process.env.SLACK_BOT_TOKEN;
var userToken = process.env.SLACK_USER_TOKEN;
var slackEvent = createEventAdapter(secret);
var slackBotClient = new WebClient(botToken);
var slackUserClient = new WebClient(userToken);
var kglLink = 'https://grouplessons-api.skyeng.ru/admin/student/view/';
var idLink = 'https://id.skyeng.ru/admin/users/';
var customerLink = 'https://fly.customer.io/env/40281/people/';
var crm1GroupLink = 'https://crm.skyeng.ru/admin/group/edit?id=';
var STUDENT_PATTERN_PREFIX = '\\s*(у|лк|student_id=|people\\/)\\s*\\-?\\.?\\s*';
var RE_STUDENT = new RegExp(STUDENT_PATTERN_PREFIX + '\\d{5,9}', 'gi');
var RE_CLEAN_STUDENT = new RegExp(STUDENT_PATTERN_PREFIX, 'gi');
var TEACHER_PATTERN_PREFIX = '\\s*(п|teacher_id=)\\s*';
var RE_TEACHER = new RegExp(TEACHER_PATTERN_PREFIX + '\\d{5,9}', 'gi');
var RE_CLEAN_TEACHER = new RegExp(TEACHER_PATTERN_PREFIX, 'gi');
var GROUP_PATTERN_PREFIX = '\\s*г(рупп.?|р)?\\.?\\s*';
var RE_GROUP = new RegExp(GROUP_PATTERN_PREFIX + '\\d{4}', 'gi');
var RE_GROUP2 = new RegExp('\\b\\d{4}\\b', 'gi');
var RE_CLEAN_GROUP = new RegExp(GROUP_PATTERN_PREFIX, 'gi');
var RE_COMMON = new RegExp('\\b\\d{5,9}\\b', 'gi');
var EXCLUDED = '\\d{4}[.-]\\d{1,2}[.-]\\d{1,2}|\\d{1,2}[.-]\\d{1,2}[.-]\\d{4}|tickets\\/\\d+|details\\/\\d+';
var RE_EXCLUDED = new RegExp(EXCLUDED, 'gi');
var SPECIAL = {
    '10148852': '<@UJAGQRJM8>hoho',
    '1734(.|[\\s\\S])*степа|степа(.|[\\s\\S])*1734': '<@UJAGQRJM8>'
};
var SPECIAL_KEYS = Object.keys(SPECIAL);
slackEvent.on('message', function (payload) { return __awaiter(void 0, void 0, void 0, function () {
    var text;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (payload.thread_ts) {
                    return [2 /*return*/];
                }
                return [4 /*yield*/, buildResponse(payload)];
            case 1:
                text = _a.sent();
                return [4 /*yield*/, postMessage(payload, text)];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
slackEvent.on('app_mention', function (payload) { return __awaiter(void 0, void 0, void 0, function () {
    var text;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!payload.thread_ts) {
                    return [2 /*return*/];
                }
                return [4 /*yield*/, buildResponse(payload)];
            case 1:
                text = _a.sent();
                return [4 /*yield*/, postMessage(payload, text)];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var server;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, slackEvent.start(process.env.PORT || 3000)];
            case 1:
                server = _a.sent();
                console.log("Listening on " + server.address().port);
                return [2 /*return*/];
        }
    });
}); })();
var threadTs = '';
function buildResponse(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var text, _a, _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    if (!payload.text) {
                        return [2 /*return*/];
                    }
                    payload = cleanPayloadText(payload);
                    threadTs = payload.thread_ts;
                    console.log(payload);
                    text = '';
                    _a = text;
                    return [4 /*yield*/, buildForStudent(payload)];
                case 1:
                    text = _a + _f.sent();
                    _b = text;
                    return [4 /*yield*/, buildForTeacher(payload)];
                case 2:
                    text = _b + _f.sent();
                    if (!!text) return [3 /*break*/, 4];
                    _c = text;
                    return [4 /*yield*/, buildCommon(payload)];
                case 3:
                    text = _c + _f.sent();
                    _f.label = 4;
                case 4:
                    _d = text;
                    return [4 /*yield*/, buildForGroup(payload)];
                case 5:
                    text = _d + _f.sent();
                    _e = text;
                    return [4 /*yield*/, buildPersonal(payload)];
                case 6:
                    text = _e + _f.sent();
                    return [2 /*return*/, text];
            }
        });
    });
}
function postMessage(payload, text) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!text) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, slackBotClient.chat.postMessage({
                            channel: payload.channel,
                            thread_ts: payload.thread_ts || payload.ts,
                            text: text,
                            unfurl_links: true
                        })];
                case 1:
                    result = _a.sent();
                    console.log(result);
                    return [2 /*return*/];
            }
        });
    });
}
function getStudentRequest(payload) {
    return payload.text.match(RE_STUDENT) || [];
}
function getTeacherRequest(payload) {
    return payload.text.match(RE_TEACHER) || [];
}
function getCommonRequest(payload) {
    return payload.text.match(RE_COMMON) || [];
}
function getGroupRequest(payload) {
    var ids1 = payload.text.match(RE_GROUP) || [];
    var ids2 = payload.text.match(RE_GROUP2) || [];
    return __spreadArrays(ids1, ids2);
}
function buildForStudent(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var sids, ids;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sids = getStudentRequest(payload);
                    if (!sids) {
                        return [2 /*return*/];
                    }
                    ids = filterRepeated(sids.map(function (sid) { return sid.replace(RE_CLEAN_STUDENT, ''); }));
                    return [4 /*yield*/, buildForStudentIds(ids)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function buildForStudentIds(ids) {
    return __awaiter(this, void 0, void 0, function () {
        var promises;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!ids) {
                        return [2 /*return*/];
                    }
                    promises = ids.map(function (id) { return __awaiter(_this, void 0, void 0, function () {
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _a = id + ": <" + kglLink + id + "|KGL> | <" + idLink + id + "|ID> | <" + customerLink + id + "|customer> ";
                                    return [4 /*yield*/, buildSearch(id)];
                                case 1: return [2 /*return*/, _a + ((_b.sent()) + "\n")];
                            }
                        });
                    }); });
                    return [4 /*yield*/, Promise.all(promises)];
                case 1: return [2 /*return*/, (_a.sent()).join('')];
            }
        });
    });
}
function buildForTeacher(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var tids, ids;
        return __generator(this, function (_a) {
            tids = getTeacherRequest(payload);
            if (!tids) {
                return [2 /*return*/];
            }
            ids = filterRepeated(tids.map(function (tid) { return tid.replace(RE_CLEAN_TEACHER, ''); }));
            return [2 /*return*/, ids.map(function (id) { return "\u041F " + id + ":  <" + idLink + id + "|ID> \n"; }).join('')];
        });
    });
}
function buildCommon(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var ids;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ids = getCommonRequest(payload);
                    if (!ids) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, buildForStudentIds(ids)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function buildForGroup(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var ids;
        return __generator(this, function (_a) {
            ids = getGroupRequest(payload);
            if (!ids) {
                return [2 /*return*/];
            }
            ids = filterRepeated(ids.map(function (id) { return id.replace(RE_CLEAN_GROUP, ''); }));
            return [2 /*return*/, ids.map(function (id) { return "<" + crm1GroupLink + id + "|\u0433\u0440\u0443\u043F\u043F\u0430 " + id + "> \n"; }).join('')];
        });
    });
}
function buildSearch(id) {
    return __awaiter(this, void 0, void 0, function () {
        var query, result, matches, links;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query = id + " in:#kids-groups-helpdesk -\u0440\u0430\u043D\u0435\u0435 -\u043F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0438\u0435 -customer -%3C%40UQ0EUGQVA%3E";
                    return [4 /*yield*/, slackUserClient.search.messages({
                            query: query,
                            sort: 'timestamp',
                            count: 60
                        })];
                case 1:
                    result = _a.sent();
                    if (!result.ok) {
                        return [2 /*return*/, ''];
                    }
                    matches = result.messages.matches || [];
                    if (0 === matches.length) {
                        return [2 /*return*/, ''];
                    }
                    links = matches.filter(function (m) { return m.username === 'kids groups helpdesk'; }).
                        filter(function (m) { return m.ts !== threadTs; }).
                        filter(function (m) { return !m.previous; }).
                        map(function (m) { return "<" + m.permalink + "|" + formatTs(m.ts) + ">"; });
                    if (0 === links.length) {
                        return [2 /*return*/, ''];
                    }
                    return [2 /*return*/, "| \u0440\u0430\u043D\u0435\u0435: " + links.join(', ')];
            }
        });
    });
}
var formatter = new Intl.DateTimeFormat('ru', {
    timeZone: 'Europe/Moscow',
    hour12: false,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
});
function formatTs(ts) {
    return formatter.format(new Date(+ts * 1000));
}
function filterRepeated(arr) {
    if (!arr) {
        return [];
    }
    var res = {};
    arr.forEach(function (it) { return res[it] = 1; });
    return Object.keys(res);
}
function cleanPayloadText(payload) {
    payload.text = payload.text.replace(RE_EXCLUDED, '');
    return payload;
}
function buildPersonal(payload) {
    var specials = SPECIAL_KEYS.map(function (key) {
        var reKey = new RegExp(key, 'gim');
        return reKey.test(payload.text) ? SPECIAL[key] + " fyi" : false;
    }).filter(function (it) { return it; });
    return filterRepeated(specials).join(', ');
}
