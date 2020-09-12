export const payload = {
  client_msg_id: '',
  type: '',
  text: '',
  user: '',
  ts: '',
  thread_ts: '',
  team: '',
  blocks: [
    {
      type: '',
      block_id: '',
      elements: [],
    },
  ],
  channel: '',
  event_ts: '',
  channel_type: '',
};
export const MENTION = '<@UJAGQRJM8> fyi';
export const MENTION_OLEG = '<@UKG25KW6P> :pray:';

export const studentTemplate = (id: number): string => `${id}: <https://grouplessons-api.skyeng.ru/admin/student/view/${id}|KGL>` +
    ` | <https://id.skyeng.ru/admin/users/${id}|ID> | <https://fly.customer.io/env/40281/people/${id}|customer> \n`;

export const teacherTemplate = (id: number): string => `${id}:  <https://id.skyeng.ru/admin/users/${id}|ID> \n`;

export const groupTemplate = (id: number): string => `<https://crm.skyeng.ru/admin/group/edit?id=${id}|группа ${id}> \n`;

