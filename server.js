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
  await buildStudentLinks(payload);
});
slackEvent.on('app_mention', async payload => {
  await buildStudentLinks(payload);
});

(async () => {
  const server = await slackEvent.start(process.env.PORT || 3000);
  console.log(`Listening on ${server.address().port}`);
})();

async function buildStudentLinks(payload) {
  if (!payload.text) {
    return;
  }
  console.log(payload);

  const ids = (payload.text.match(/([у]|[л][к])\s*\d{5,}/gi) || []).map(sid => sid.replace(/([у]|[л][к])\s*/gi, ''));
  if (0 === ids.length) {
    return;
  }
  const links = await buildLinks(ids);

  await slackBotClient.chat.postMessage({
    channel: payload.channel,
    thread_ts: payload.thread_ts || payload.ts,
    text: links,
    unfurl_links: true,
  });
}

async function buildLinks(ids) {
  const promises = ids.map(async id => {
    return `${id}: <${kglLink}${id}|KGL> | <${idLink}${id}|ID> | <${customerLink}${id}|customer> `
        + `${await buildSearch(id)}`;
  });
  return (await Promise.all(promises)).join('\n');
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
