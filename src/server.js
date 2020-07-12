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
exports.buildSearch = void 0;
const parser_1 = require("./parser");
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
let threadTs = '';
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
    threadTs = payload.thread_ts;
    const text = yield parser_1.buildResponse(payload);
    yield postMessage(payload, text);
}));
(() => __awaiter(void 0, void 0, void 0, function* () {
    const server = yield slackEvent.start(process.env.PORT || 3000);
    console.log(`Listening on ${server.address().port}`);
}))();
// TODO унести из сервера
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
// TODO унести из сервера
function buildSearch(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = `${id} in:#kids-groups-helpdesk -ранее -предыдущие -customer -%3C%40UQ0EUGQVA%3E`;
        const result = yield slackUserClient.search.messages({
            query: query,
            sort: 'timestamp',
            count: 60,
        });
        if (!result.ok) {
            return '';
        }
        const matches = result.messages.matches || [];
        if (0 === matches.length) {
            return '';
        }
        const links = matches.filter(m => m.username === 'kids groups helpdesk').
            filter(m => m.ts !== threadTs).
            filter(m => !m.previous).
            map(m => `<${m.permalink}|${formatTs(m.ts)}>`);
        if (0 === links.length) {
            return '';
        }
        return `| ранее: ` + links.join(', ');
    });
}
exports.buildSearch = buildSearch;
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
