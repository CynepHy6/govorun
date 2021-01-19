import {BOT_NAME, BOT_OWNER, EMOJI_NO_ENTRY_SIGN, Payload, Reaction, SearchResult} from './models';
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

slackEvent.on('reaction_added', async (reaction: Reaction) => {
  if (BOT_OWNER !== reaction.user && BOT_NAME !== reaction.item_user) {
    return;
  }
  if (EMOJI_NO_ENTRY_SIGN === reaction.reaction) {
    console.log('deleted: ', reaction)
    await slackBotClient.chat.delete({
      channel: reaction.item.channel,
      ts: reaction.item.ts,
    });
  }
});

(async () => {
  const server = await slackEvent.start(process.env.PORT || 80);
  console.log(`Listening on ${server.address().port}`);
})();

// TODO унести из сервера?
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

export async function search(query: string): Promise<SearchResult[]> {
  // проверка на userToken тут, чтобы юнит-тесты работали
  const result = userToken && await slackUserClient.search.messages({
    query: query,
    sort: 'timestamp',
    count: 60,
  });
  if (!result.ok) {
    return [];
  }
  return result.messages.matches || [];
}
