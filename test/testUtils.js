"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupTemplate = exports.teacherTemplate = exports.studentTemplate = exports.specMention = exports.payload = void 0;
exports.payload = {
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
exports.specMention = '<@UJAGQRJM8> fyi';
exports.studentTemplate = (id) => `${id}: <https://grouplessons-api.skyeng.ru/admin/student/view/${id}|KGL>` +
    ` | <https://id.skyeng.ru/admin/users/${id}|ID> | <https://fly.customer.io/env/40281/people/${id}|customer> \n`;
exports.teacherTemplate = (id) => `${id}:  <https://id.skyeng.ru/admin/users/${id}|ID> \n`;
exports.groupTemplate = (id) => `<https://crm.skyeng.ru/admin/group/edit?id=${id}|группа ${id}> \n`;
