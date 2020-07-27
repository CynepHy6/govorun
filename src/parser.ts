import {Ids, Payload, Special} from './models';
import {search} from './server';
import {filterRepeated, formatTs} from './utils';
import moment from 'moment';

const STUDENT = '\\s*(у|лк|student_id=|people\\/)\\s*\\-?\\.?\\s*';
const TEACHER = '\\s*(teacher_id=|п)\\s*';
const GROUP = '(\\s*г(рупп.?|р)?\\.?\\s*)';
const EXCLUDED = '\\d{4}[.-]\\d{1,2}[.-]\\d{1,2}'
    + '|\\d{1,2}[.-]\\d{1,2}[.-]\\d{4}'
    + '|tickets\\/\\d+'
    + '|details\\/\\d+'
    + '|thread_ts=\\d+[.]\\d+'
    + '|(\\d+[+@-])+\\d*|[+@-]\\d+'
    + '|pageId=.*?\\d+'
    + '|\\d{10,}'
    + '|(=?\\d+)([_])'
    + '|\\d+[*]+\\d*'
    + '|\\d{4}\\s*[р₽][\\s.]?'
;
const RE_STUDENT = new RegExp(STUDENT + '\\d{5,9}', 'gi');
const RE_CLEAN_STUDENT = new RegExp(STUDENT, 'gi');
const RE_TEACHER = new RegExp(TEACHER + '\\d{5,9}', 'gi');
const RE_CLEAN_TEACHER = new RegExp(TEACHER, 'gi');
const RE_GROUP = new RegExp('\\b\\d{4}\\b', 'giu');
const RE_CLEAN_GROUP = new RegExp(GROUP, 'gi');
const RE_COMMON = new RegExp('\\b\\d{5,9}\\b', 'gi');
const RE_EXCLUDED = new RegExp(EXCLUDED, 'gi');

const SPECIAL: Special = {
  '10148852': '<@UJAGQRJM8>',
  '1832(.|[\\s\\S])*ст.па|ст.па(.|[\\s\\S])*1832': '<@UJAGQRJM8>',
};
const SPECIAL_KEYS = Object.keys(SPECIAL);

const kglLink = 'https://grouplessons-api.skyeng.ru/admin/student/view/';
const idLink = 'https://id.skyeng.ru/admin/users/';
const customerLink = 'https://fly.customer.io/env/40281/people/';
const crm1GroupLink = 'https://crm.skyeng.ru/admin/group/edit?id=';

let threadTs: string;

export async function buildResponse(payload: Payload) {
  if (!payload.text) {
    return;
  }
  threadTs = payload.thread_ts || '';
  payload = cleanPayloadText(payload);
  console.log(payload);

  const ids = parseIds(payload);
  return ''
      + await buildForStudentIds(ids.students)
      + await buildForTeacherIds(ids.teachers)
      + await buildForGroupIds(ids.groups)
      + await buildSpecial(payload);
}

function parseIds(payload: Payload): Ids {
  const ids = {
    students: filterRepeated([...getStudentIds(payload), ...getCommonIds(payload)]),
    teachers: filterRepeated(getTeacherIds(payload)),
    groups: filterRepeated(getGroupIds(payload)),
  };
  ids.students = ids.students.filter(id => ids.teachers.indexOf(id) === -1);
  return ids;
}

function getStudentIds(payload: Payload): string[] {
  const sids = payload.text.match(RE_STUDENT) || [];
  return sids.map(sid => sid.replace(RE_CLEAN_STUDENT, ''));
}

function getTeacherIds(payload: Payload): string[] {
  const sids = payload.text.match(RE_TEACHER) || [];
  return sids.map(sid => sid.replace(RE_CLEAN_TEACHER, ''));
}

function getCommonIds(payload: Payload): string[] {
  return payload.text.match(RE_COMMON) || [];
}

function getGroupIds(payload: Payload): string[] {
  const ids = payload.text.match(RE_GROUP) || [];
  return ids.map(id => id.replace(RE_CLEAN_GROUP, ''));
}

async function buildForStudentIds(ids: string[]) {
  if (!ids) {
    return;
  }
  const promises = ids.map(async id => {
    return `${id}: <${kglLink}${id}|KGL> | <${idLink}${id}|ID> | <${customerLink}${id}|customer> `
        + `${await searchHelpdesk(id)}\n`;
  });
  return (await Promise.all(promises)).join('');
}

async function buildForTeacherIds(ids: string[]) {
  if (!ids) {
    return;
  }
  return ids.map(id => `${id}:  <${idLink}${id}|ID> \n`).join('');
}

async function buildForGroupIds(ids: string[]) {
  if (!ids) {
    return;
  }
  const promises = ids.map(async id => `<${crm1GroupLink}${id}|группа ${id}> ${await searchZameny(id)}\n`);
  return (await Promise.all(promises)).join('');
}

function cleanPayloadText(payload: Payload): Payload {
  payload.text = payload.text.replace(RE_EXCLUDED, '');
  return payload;
}

function buildSpecial(payload: Payload): string {
  const specials = SPECIAL_KEYS.map(key => {
    const reKey = new RegExp(key, 'gim');
    return reKey.test(payload.text) ? `${SPECIAL[key]} fyi` : false;
  }).filter(it => it) as string[];
  return filterRepeated(specials).join(', ');
}

async function searchHelpdesk(id: string): Promise<string> {
  const messages = await search(`${id} in:#kids-groups-helpdesk -ранее -предыдущие -customer -%3C%40UQ0EUGQVA%3E`);
  const links = messages.filter(m => m.username === 'kids groups helpdesk')
      .filter(m => m.ts !== threadTs)
      .filter(m => !m.previous)
      .map(m => `<${m.permalink}|${formatTs(m.ts)}>`);
  if (0 === links.length) {
    return '';
  }
  return `| ранее: ` + links.join(', ');
}

async function searchZameny(groupId: string): Promise<string> {
  const after = moment().subtract(7, 'day').format('YYYY-MM-DD');
  const query = `${groupId} in:#kgl-zameny after:${after}`;
  const messagges = await search(query);
  const links = messagges.filter(m => m.ts !== threadTs)
      // .filter(m => {
      //   console.log(m);
      //   return !m.previous;
      // })
      .map(m => `<${m.permalink}|${formatTs(m.ts)}>`);
  if (0 === links.length) {
    return '';
  }
  return `| замены: ` + links.join(', ');
}
