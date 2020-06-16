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

slackEvent.on('message', async payload => {
  if (payload.thread_ts) {
    return;
  }
  await buildResponse(payload);
});
slackEvent.on('app_mention', async payload => {
  await buildResponse(payload);
});

(async () => {
  const server = await slackEvent.start(process.env.PORT || 3000);
  console.log(`Listening on ${server.address().port}`);
})();

const studentPattern = '\\s+([у]|[л][к])\\s*';
let threadTs = '';

function getStudentRequest(payload) {
  const re = new RegExp(studentPattern + '\\d{5,}', 'gi');
  return payload.text.match(re) || [];
}

async function buildResponse(payload) {
  if (!payload.text) {
    return;
  }
  threadTs = payload.thread_ts;
  console.log(payload);
  let text = '';
  const sids = getStudentRequest(payload);
  if (sids) {
    const re = new RegExp(studentPattern, 'gi');
    const ids = sids.map(sid => sid.replace(re, ''));
    text = await buildForStudent(ids);
  }

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

async function buildForStudent(ids) {
  const promises = ids.map(async id => {
    return `${id}: <${kglLink}${id}|KGL> | <${idLink}${id}|ID> | <${customerLink}${id}|customer> `
        + `${await buildSearch(id)}\n`;
  });
  return (await Promise.all(promises)).join('');
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
  console.log('MATCHES ', matches);
  if (0 === matches.length) {
    return '';
  }
  console.log(threadTs)
  const links = matches.filter(m => m.username === 'kids groups helpdesk')
      .filter(m => m.ts !== threadTs)
      .map(m => `<${m.permalink}|${cleanText(m.text)}>`);
  if (0 === links.length) {
    return '';
  }
  return `| ранее: ` + links.join(', ');
}

function cleanText(text) {
  return text.replace(/\n/g, ' ')
      .replace(/<.*?>|`|'/g, '')
      .substring(0, 20);
}
