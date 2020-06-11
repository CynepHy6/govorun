const env = require('dotenv')
const { createEventAdapter } = require("@slack/events-api");
const { WebClient } = require("@slack/web-api");

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
const token = process.env.SLACK_TOKEN;

const slackEvent = createEventAdapter(secret);
const slackClient = new WebClient(token);

const kglLink = "https://grouplessons-api.skyeng.ru/admin/student/view/";
const idLink = "https://id.skyeng.ru/admin/users/";
const customerLink = "https://fly.customer.io/env/40281/people/";

slackEvent.on("message", async payload => {
  await buildStudentLinks(payload);
});

(async () => {
  const server = await slackEvent.start(process.env.PORT || 3000);

  console.log(`Listening on ${server.address().port}`);
})();

async function buildStudentLinks(payload) {
  if (payload.thread_ts || !payload.text) {
    return;
  }
  console.log(payload);

  const text = (payload.text.match(/(У|[Лл][Кк])\s*\d{5,}/g) || [])
  .map(sid => sid.replace(/(У|[Лл][Кк])\s*/, ""))
  .map(
      id =>
          `${id}: <${kglLink}${id}|KGL> | <${idLink}${id}|ID> | <${customerLink}${id}|customer>`
  )
  .join("\n");

  if (text) {
    await slackClient.chat.postMessage({
      channel: payload.channel,
      thread_ts: payload.ts,
      text: text
    });
  }
}
