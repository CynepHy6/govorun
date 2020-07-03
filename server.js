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

const studentPattern = '\\s*(у|лк)\\s*\\-?\\.?\\s*';
const teacherPattern = '\\s*([п])\\s*';
const groupPattern = '\\s*г(рупп.?|р)?\\.?\\s*';
let threadTs = '';

async function buildResponse(payload) {
  if (!payload.text) {
    return;
  }
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
  const re = new RegExp(studentPattern + '\\d{5,}', 'gi');
  return payload.text.match(re) || [];
}

function getTeacherRequest(payload) {
  const re = new RegExp(teacherPattern + '\\d{5,}', 'gi');
  return payload.text.match(re) || [];
}

function getCommonRequest(payload) {
  const re = new RegExp('\\b\\d{6,}\\b', 'gi');
  return payload.text.match(re) || [];
}

function getGroupRequest(payload) {
  const re = new RegExp(groupPattern + '\\d{3,5}', 'gi');
  return payload.text.match(re) || [];
}

async function buildForStudent(payload) {
  const sids = getStudentRequest(payload);
  if (!sids) {
    return;
  }
  const re = new RegExp(studentPattern, 'gi');
  const ids = sids.map(sid => sid.replace(re, ''));
  return await buildForStudentIds(ids)
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
  const re = new RegExp(teacherPattern, 'gi');
  const ids = tids.map(tid => tid.replace(re, ''));
  return ids.map(id => `П ${id}:  <${idLink}${id}|ID> \n`).join('');
}

async function buildCommon(payload) {
  const ids = getCommonRequest(payload);
  if (!ids) {
    return;
  }
  return await buildForStudentIds(ids)
}

async function buildForGroup(payload) {
  let ids = getGroupRequest(payload);
  if (!ids) {
    return;
  }
  const re = new RegExp(groupPattern, 'gi');
  ids = ids.map(id => id.replace(re, ''));
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

function cleanText(text) {
  return text.replace(/\n/g, ' ')
      .replace(/<.*?>|`|'/g, '')
      .substring(0, 20);
}
