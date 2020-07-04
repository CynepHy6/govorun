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

env.config();
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

slackEvent.on('message', async payload => {
  if (payload.thread_ts) {
    return;
  }
  await buildResponse(payload);
});
slackEvent.on('app_mention', async payload => {
  if (!payload.thread_ts) {
    return;
  }
  await buildResponse(payload);
});

(async () => {
  const server = await slackEvent.start(process.env.PORT || 3000);
  console.log(`Listening on ${server.address().port}`);
})();

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

const BAD_PATTERN = '\\d{2}[.-]\\d{2}[.-]\\d{4}';
const RE_CLEAN = new RegExp(BAD_PATTERN, 'gi');

let threadTs = '';

async function buildResponse(payload) {
  if (!payload.text) {
    return;
  }
  payload = cleanPayloadText(payload)
  threadTs = payload.thread_ts;
  console.log(payload);
  let text = '';
  text += await buildForStudent(payload);
  text += await buildForTeacher(payload);
  if (!text) {
    text += await buildCommon(payload);
  }
  text += await buildForGroup(payload);

  if (!text) {
    return;
  }
  await slackBotClient.chat.postMessage({
    channel: payload.channel,
    thread_ts: payload.thread_ts || payload.ts,
    text: text,
    unfurl_links: true,
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
  return payload.text.match(RE_GROUP) || payload.text.match(RE_GROUP2) || [];
}

async function buildForStudent(payload) {
  const sids = getStudentRequest(payload);
  if (!sids) {
    return;
  }
  const ids = filterRepeated(sids.map(sid => sid.replace(RE_CLEAN_STUDENT, '')));
  return await buildForStudentIds(ids);
}

async function buildForStudentIds(ids) {
  if (!ids) {
    return;
  }
  const promises = ids.map(async id => {
    return `${id}: <${kglLink}${id}|KGL> | <${idLink}${id}|ID> | <${customerLink}${id}|customer> `
        + `${await buildSearch(id)}\n`;
  });
  return (await Promise.all(promises)).join('');
}

async function buildForTeacher(payload) {
  const tids = getTeacherRequest(payload);
  if (!tids) {
    return;
  }
  const ids = filterRepeated(tids.map(tid => tid.replace(RE_CLEAN_TEACHER, '')));
  return ids.map(id => `П ${id}:  <${idLink}${id}|ID> \n`).join('');
}

async function buildCommon(payload) {
  const ids = getCommonRequest(payload);
  if (!ids) {
    return;
  }
  return await buildForStudentIds(ids);
}

async function buildForGroup(payload) {
  let ids = getGroupRequest(payload);
  if (!ids) {
    return;
  }
  ids = filterRepeated(ids.map(id => id.replace(RE_CLEAN_GROUP, '')));
  return ids.map(id => `<${crm1GroupLink}${id}|группа ${id}> \n`).join('');
}

async function buildSearch(id) {
  const query = `${id} in:#kids-groups-helpdesk -ранее -предыдущие -customer -%3C%40UQ0EUGQVA%3E`;
  const result = await slackUserClient.search.messages({
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

  const links = matches.filter(m => m.username === 'kids groups helpdesk')
      .filter(m => m.ts !== threadTs)
      .filter(m => !m.previous)
      .map(m => `<${m.permalink}|${formatTs(m.ts)}>`);
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

function formatTs(ts) {
  return formatter.format(new Date(+ts * 1000));
}

function filterRepeated(arr) {
  if (!arr){
    return []
  }
  const res = {}
  arr.forEach(it => res[it] = 1)
  return Object.keys(res);
}

function cleanPayloadText(payload) {
  payload.text = payload.text.replace(RE_CLEAN, '')
  return payload;
}
