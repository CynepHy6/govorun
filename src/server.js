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
exports.search = void 0;
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
