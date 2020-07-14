import {Ids, Payload, Special} from './models';
import {buildSearch} from './server';

const kglLink = 'https://grouplessons-api.skyeng.ru/admin/student/view/';
const idLink = 'https://id.skyeng.ru/admin/users/';
const customerLink = 'https://fly.customer.io/env/40281/people/';
const crm1GroupLink = 'https://crm.skyeng.ru/admin/group/edit?id=';

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

const EXCLUDED = '\\d{4}[.-]\\d{1,2}[.-]\\d{1,2}|\\d{1,2}[.-]\\d{1,2}[.-]\\d{4}|tickets\\/\\d+|details\\/\\d+|pageId=.*?\\d+';
const RE_EXCLUDED = new RegExp(EXCLUDED, 'gi');

const SPECIAL: Special = {
  '10148852': '<@UJAGQRJM8>',
  '1734(.|[\\s\\S])*степа|степа(.|[\\s\\S])*1734': '<@UJAGQRJM8>',
};
const SPECIAL_KEYS = Object.keys(SPECIAL);

export async function buildResponse(payload: Payload) {
  if (!payload.text) {
    return;
  }
  payload = cleanPayloadText(payload);
  console.log(payload);

  const ids = parseIds(payload);
  let text = '';
  text += await buildForStudentIds(ids.students);
  text += await buildForTeacherIds(ids.teachers);
  text += await buildForGroupIds(ids.groups);
  text += await buildSpecial(payload);
  return text;
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
  const ids1 = payload.text.match(RE_GROUP) || [];
  const ids2 = payload.text.match(RE_GROUP2) || [];

  const ids = [...ids1, ...ids2];
  return ids.map(id => id.replace(RE_CLEAN_GROUP, ''));
}

async function buildForStudentIds(ids: string[]) {
  if (!ids) {
    return;
  }
  const promises = ids.map(async id => {
    return `${id}: <${kglLink}${id}|KGL> | <${idLink}${id}|ID> | <${customerLink}${id}|customer> `
        + `${await buildSearch(id)}\n`;
  });
  return (await Promise.all(promises)).join('');
}

async function buildForTeacherIds(ids: string[]) {
  if (!ids) {
    return;
  }
  return ids.map(id => `П ${id}:  <${idLink}${id}|ID> \n`).join('');
}

async function buildForGroupIds(ids: string[]) {
  if (!ids) {
    return;
  }
  return ids.map(id => `<${crm1GroupLink}${id}|группа ${id}> \n`).join('');
}

function filterRepeated(arr: string[]) {
  return [...new Set(arr)];
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
