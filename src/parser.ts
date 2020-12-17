import {CHANNEL_HELPDESK, CHANNEL_KGL_ALERT, Ids, Payload} from './models';
import {search} from './server';
import {filterRepeated, formatTs} from './utils';
import moment from 'moment';

const STUDENT = '\\s*(у|лк|student_id=|people\\/)\\s*\\-?\\.?\\s*';
const TEACHER = '\\s*(teacher_id=|п)\\s*';
const EXCLUDED = '\\d{4}[.-]\\d{1,2}[.-]\\d{1,2}'
  + '|\\d{3,}\\.\\d{3,}'
  + '|<mailto:.*?>'
  + '|\\d{1,2}[.-\\s]\\d{1,2}[.-\\s]\\d{4}\\b'
  + '|\\b\\d{1,2}\\s[a-zA-Z-яА-Я]{3,}\\s\\d{4}\\b'
  + '|tickets\\/\\d+'
  + '|details\\/\\d+'
  + '|thread_ts=\\d+[.]\\d+'
  + '|(\\d+[+@-])+\\d*|[+@-]\\d+'
  + '|(page|g)Id=.*?\\d+'
  + '|\\d{10,}'
  + '|(=?\\d+)([_])'
  + '|\\d+[*]+\\d*'
  + '|\\d{4}\\s*[р][\\s.]+'
  + '|\\d{4}\\s*₽'
  + '|\\/\\d+#'
  + '|\\d+\\.\\d+'
  + '|\\/env\\/\\d+\\/'
  + '|\\/services\\/\\d+'
;
const RE_STUDENT = new RegExp(STUDENT + '\\d{5,9}', 'gi');
const RE_CLEAN_STUDENT = new RegExp(STUDENT, 'gi');
const RE_TEACHER = new RegExp(TEACHER + '\\d{5,9}', 'gi');
const RE_CLEAN_TEACHER = new RegExp(TEACHER, 'gi');
const RE_GROUP = new RegExp('\\b\\d{4}\\b', 'g');
const RE_COMMON = new RegExp('\\b\\d{5,9}\\b', 'g');
const RE_EXCLUDED = new RegExp(EXCLUDED, 'gi');
const RE_REFERAL = /((установи|добав|начисли|подарок|актив|ждут).*?реф(ерал)?)/gmi;

const kglLink = 'https://grouplessons-api.skyeng.ru/admin/student/view/';
const idLink = 'https://id.skyeng.ru/admin/users/';
const customerLink = 'https://fly.customer.io/env/40281/people/';
const crm1GroupLink = 'https://crm.skyeng.ru/admin/group/edit?id=';
const crm2Link = 'https://crm2.skyeng.ru/persons/';

let threadTs: string;
let payload: Payload;

export async function buildResponse(p: Payload) {
  if (!p.text) {
    return;
  }
  threadTs = p.thread_ts || '';
  p = cleanPayloadText(p);
  payload = p;
  console.log(p);

  const ids = parseIds(p);
  let res = greetings()
    + await buildForStudentIds(ids.students, p.text)
    + await buildForTeacherIds(ids.teachers)
    + await buildForGroupIds(ids.groups);
  if (res && res !== greetings()) {
    res += await buildRefCode(p);
  }
  return res;
}

function parseIds(payload: Payload): Ids {
  const ids = {
    students: filterRepeated([...getStudentIds(payload), ...getCommonIds(payload)]).sort(sortAsNum),
    teachers: filterRepeated(getTeacherIds(payload)).sort(sortAsNum),
    groups: filterRepeated(getGroupIds(payload)).sort(sortAsNum),
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
  return payload.text.match(RE_GROUP) || [];
}

async function buildForStudentIds(ids: string[], text: string) {
  if (!ids) {
    return;
  }
  const promises = ids.map(async id => {
    return `${id}: <${idLink}${id}|ID> | <${crm2Link}${id}|CRM2> | <${kglLink}${id}|KGL> | <${customerLink}${id}|customer> `
      + `${await searchHelpdesk(id, text)}\n`;
  });
  return (await Promise.all(promises)).join('');
}

async function buildForTeacherIds(ids: string[]) {
  if (!ids) {
    return;
  }
  return ids.map(id => `${id}: <${idLink}${id}|ID> | <${crm2Link}${id}|CRM2> \n`).join('');
}

async function buildForGroupIds(ids: string[]) {
  if (!ids) {
    return;
  }
  const promises = ids.map(async id => {
    const zameny = await searchZameny(id);
    if (!zameny && CHANNEL_KGL_ALERT === payload.channel) {
      return '';
    }
    return `<${crm1GroupLink}${id}|группа ${id}> ${zameny}\n`;
  });
  return (await Promise.all(promises)).join('');
}

function cleanPayloadText(payload: Payload): Payload {
  payload.text = payload.text.replace(RE_EXCLUDED, '');
  return payload;
}

async function buildRefCode(payload: Payload) {
  if (CHANNEL_HELPDESK !== payload.channel) {
    return '';
  }
  const matches = payload.text.match(RE_REFERAL) || [];
  if (matches.length === 0) {
    return '';
  }
  return '<@UKG25KW6P> :pray:';
}

async function searchHelpdesk(id: string, text: string): Promise<string> {
  const messages = await search(`${id} in:#kids-groups-helpdesk -ранее -предыдущие -customer -%3C%40UQ0EUGQVA%3E`);
  const links = messages.filter(m => m.username === 'kids groups helpdesk')
    .filter(m => m.ts !== threadTs)
    .filter(m => !m.previous)
    .filter(m => m.text !== text)
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
    .map(m => `<${m.permalink}|${formatTs(m.ts)}>`);
  if (0 === links.length) {
    return '';
  }
  return `| замены: ` + links.join(', ');
}

const sortAsNum = (a: any, b: any): number => +a - +b;

export function greetings() {
  if (CHANNEL_HELPDESK !== payload.channel) {
    return '';
  }
  return `Привет!

Вот как можно решить твою проблему:
*Коммуникации с пользователем* (звонки, перезвоны, договоренности) - <https://skyeng.slack.com/archives/CNA02RLJH|#kgl-cs-questions>
*Проблемы с оплатой на вводном уроке* - <https://skyeng.slack.com/archives/CAT9LJ665|#tech-sup-methodists>
*Компенсация уроков* (лишнее списание, что-то еще) - <https://skyeng.slack.com/archives/CNA02RLJH|#kgl-cs-questions>
Если *подбор группы* выдает ошибку - проверь у ученика уровень, возраст и класс.
Если *нет возможности создать запрос на подбор группы* проверь, есть ли уже задача на подбор.
Если проблема с задачами *Awake, Исходящей линии, Техподдержки, робозвонками* - <https://skyeng.slack.com/archives/CBD8J8LG3|#crm2-support>

Если твой запрос попадает под одну из категорий выше, закрой его, пожалуйста, или мы это сделаем сами.

Если ничего не подходит, мы ответим в течение 2 часов.

`
}
