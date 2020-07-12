import {Payload, SearchResult} from './models';
import {buildResponse} from './parser';

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
const secret = process.env.SLACK_SIGNING_SECRET || '';
const botToken = process.env.SLACK_BOT_TOKEN || '';
const userToken = process.env.SLACK_USER_TOKEN || '';

const slackEvent = createEventAdapter(secret);
const slackBotClient = new WebClient(botToken);
const slackUserClient = new WebClient(userToken);

let threadTs = '';
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
  threadTs = payload.thread_ts;
  const text = await buildResponse(payload);
  await postMessage(payload, text);
});

(async () => {
  const server = await slackEvent.start(process.env.PORT || 3000);
  console.log(`Listening on ${server.address().port}`);
})();

// TODO унести из сервера
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

// TODO унести из сервера
export async function buildSearch(id: string) {
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
