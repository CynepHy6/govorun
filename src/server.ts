import {Payload, SearchResult, Special} from './models';

const env = require('dotenv');
const {createEventAdapter} = require('@slack/events-api');
const {WebClient} = require('@slack/web-api');

// const express = require('express');
// const app = express();
// app.use(express.json())
// app.post('/', function (req, res) {
//   res.send(req.body.challenge);
// });
//
// app.listen(80);

env.config({path: '../.env'});
const secret = process.env.SLACK_SIGNING_SECRET;
const botToken = process.env.SLACK_BOT_TOKEN;
const userToken = process.env.SLACK_USER_TOKEN;

const slackEvent = createEventAdapter(secret);
const slackBotClient = new WebClient(botToken);
const slackUserClient = new WebClient(userToken);

const kglLink = 'https://grouplessons-api.skyeng.ru/admin/student/view/';
const idLink = 'https://id.skyeng.ru/admin/users/';
const customerLink = 'https://fly.customer.io/env/40281/people/';
const crm1GroupLink = 'https://crm.skyeng.ru/admin/group/edit?id=';

const STUDENT_PATTERN_PREFIX = '\\s*(у|лк|student_id=|people\\/)\\s*\\-?\\.?\\s*';
const RE_STUDENT = new RegExp(STUDENT_PATTERN_PREFIX + '\\d{5,9}', 'gi');
const RE_CLEAN_STUDENT = new RegExp(STUDENT_PATTERN_PREFIX, 'gi');

const TEACHER_PATTERN_PREFIX = '\\s*(п|teacher_id=)\\s*';
const RE_TEACHER = new RegExp(TEACHER_PATTERN_PREFIX + '\\d{5,9}', 'gi');
const RE_CLEAN_TEACHER = new RegExp(TEACHER_PATTERN_PREFIX, 'gi');

const GROUP_PATTERN_PREFIX = '\\s*г(рупп.?|р)?\\.?\\s*';
const RE_GROUP = new RegExp(GROUP_PATTERN_PREFIX + '\\d{4}', 'gi');
const RE_GROUP2 = new RegExp('\\b\\d{4}\\b', 'gi');
const RE_CLEAN_GROUP = new RegExp(GROUP_PATTERN_PREFIX, 'gi');

const RE_COMMON = new RegExp('\\b\\d{5,9}\\b', 'gi');

const EXCLUDED = '\\d{4}[.-]\\d{1,2}[.-]\\d{1,2}|\\d{1,2}[.-]\\d{1,2}[.-]\\d{4}|tickets\\/\\d+|details\\/\\d+';
const RE_EXCLUDED = new RegExp(EXCLUDED, 'gi');

const SPECIAL: Special = {
  '10148852': '<@UJAGQRJM8>hoho',
  '1734(.|[\\s\\S])*степа|степа(.|[\\s\\S])*1734': '<@UJAGQRJM8>',
};
const SPECIAL_KEYS = Object.keys(SPECIAL);

slackEvent.on('message', async (payload: Payload) => {
  if (payload.thread_ts) {
    return;
  }
  const text = await buildResponse(payload);
  await postMessage(payload, text);
});
slackEvent.on('app_mention', async (payload: Payload) => {
  if (!payload.thread_ts) {
    return;
  }
  const text = await buildResponse(payload);
  await postMessage(payload, text);
});

(async () => {
  const server = await slackEvent.start(process.env.PORT || 3000);
  console.log(`Listening on ${server.address().port}`);
})();

let threadTs = '';

export async function buildResponse(payload: Payload) {
  if (!payload.text) {
    return;
  }
  payload = cleanPayloadText(payload);
  threadTs = payload.thread_ts || '';
  console.log(payload);

  let text = '';
  text += await buildForStudent(payload);
  text += await buildForTeacher(payload);
  if (!text) {
    text += await buildCommon(payload);
  }
  text += await buildForGroup(payload);
  text += await buildPersonal(payload);
  return text;
}

async function postMessage(payload: Payload, text?: string) {
  if (!text) {
    return;
  }
  const result = await slackBotClient.chat.postMessage({
    channel: payload.channel,
    thread_ts: payload.thread_ts || payload.ts,
    text: text,
    unfurl_links: true,
  });
  console.log(result);
}

function getStudentRequest(payload: Payload): string[] {
  return payload.text.match(RE_STUDENT) || [];
}

function getTeacherRequest(payload: Payload): string[] {
  return payload.text.match(RE_TEACHER) || [];
}

function getCommonRequest(payload: Payload): string[] {
  return payload.text.match(RE_COMMON) || [];
}

function getGroupRequest(payload: Payload): string[] {
  const ids1 = payload.text.match(RE_GROUP) || [];
  const ids2 = payload.text.match(RE_GROUP2) || [];

  return [...ids1, ...ids2];
}

async function buildForStudent(payload: Payload) {
  const sids = getStudentRequest(payload);
  if (!sids) {
    return;
  }
  const ids = filterRepeated(sids.map(sid => sid.replace(RE_CLEAN_STUDENT, '')));
  return await buildForStudentIds(ids);
}

async function buildForStudentIds(ids: string[]) {
  if (!ids) {
    return;
  }
  const promises = ids.map(async id => {
    return `${id}: <${kglLink}${id}|KGL> | <${idLink}${id}|ID> | <${customerLink}${id}|customer> `
        + `${await buildSearch(id)}\n`;
  });
  return (await Promise.all(promises)).join('');
}

async function buildForTeacher(payload: Payload) {
  const tids = getTeacherRequest(payload);
  if (!tids) {
    return;
  }
  const ids = filterRepeated(tids.map(tid => tid.replace(RE_CLEAN_TEACHER, '')));
  return ids.map(id => `П ${id}:  <${idLink}${id}|ID> \n`).join('');
}

async function buildCommon(payload: Payload) {
  const ids = getCommonRequest(payload);
  if (!ids) {
    return;
  }
  return await buildForStudentIds(ids);
}

async function buildForGroup(payload: Payload) {
  let ids = getGroupRequest(payload);
  if (!ids) {
    return;
  }
  ids = filterRepeated(ids.map(id => id.replace(RE_CLEAN_GROUP, '')));
  return ids.map(id => `<${crm1GroupLink}${id}|группа ${id}> \n`).join('');
}

async function buildSearch(id: string) {
  const query = `${id} in:#kids-groups-helpdesk -ранее -предыдущие -customer -%3C%40UQ0EUGQVA%3E`;
  const result = await slackUserClient.search.messages({
    query: query,
    sort: 'timestamp',
    count: 60,
  });

  if (!result.ok) {
    return '';
  }
  const matches: SearchResult[] = result.messages.matches || [];

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
}

const formatter = new Intl.DateTimeFormat('ru', {
  timeZone: 'Europe/Moscow',
  hour12: false,
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
});

function formatTs(ts: string): string {
  return formatter.format(new Date(+ts * 1000));
}

function filterRepeated(arr: string[]): string[] {
  return [...new Set(arr)];
}

function cleanPayloadText(payload: Payload): Payload {
  payload.text = payload.text.replace(RE_EXCLUDED, '');
  return payload;
}

function buildPersonal(payload: Payload): string {
  const specials = SPECIAL_KEYS.map(key => {
    const reKey = new RegExp(key, 'gim');
    return reKey.test(payload.text) ? `${SPECIAL[key]} fyi` : false;
  }).filter(it => it) as string[];
  return filterRepeated(specials).join(', ');
}
