import {MENTION_OLEG, payload, studentTemplate, teacherTemplate} from './utils-test';
import {greetings, buildResponse} from '../src/parser';
import {CHANNEL_HELPDESK} from '../src/models';

const expect = require('chai').expect;
console.log = () => {
};

describe('студент или учитель', () => {
  it('12345678', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(studentTemplate(12345678)).equal(result);
  });
  it('у12345678', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(studentTemplate(12345678)).equal(result);
  });
  it('лк12345678', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(studentTemplate(12345678)).equal(result);
  });
  it('у12345678 99999999', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(studentTemplate(12345678) + studentTemplate(99999999)).equal(result);
  });

  it('у12345678 12345678 99999999', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(studentTemplate(12345678) + studentTemplate(99999999)).equal(result);
  });

  it('у 12345678 П 12345678 99999999', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(studentTemplate(99999999) + teacherTemplate(12345678)).equal(result);
  });

  it('спец 10148852 добавляет тег', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(studentTemplate(10148852)).equal(result);
  });

  it('12345678 123-123456 123123-123456-123456 123123-123456-', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(studentTemplate(12345678)).equal(result);
  });
  it('12345678 1234566@mail.ru', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(studentTemplate(12345678)).equal(result);
  });
  it('12345678 pageId=777777', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(studentTemplate(12345678)).equal(result);
  });
  it('У 1234567 У 12345678912', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(studentTemplate(1234567)).equal(result);
  });
  it('.1234567 1234568.', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(studentTemplate(1234567) + studentTemplate(1234568)).equal(result);
  });
  it('1234567 123456**1234', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(studentTemplate(1234567)).equal(result);
  });
  it('1234567 РУ', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(studentTemplate(1234567)).equal(result);
  });
  it('1234567 <mailto:poimanova@mail.ru|poimanova@mail.ru>', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(studentTemplate(1234567)).equal(result);
  });
  it('1234567 рекомендовал 76543210', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(studentTemplate(1234567) + studentTemplate(76543210)).equal(result);
  });
  it('edit#gid=281841282 1234567', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(studentTemplate(1234567)).equal(result);
  });
  it('1234567 Нужно начислить реф. бонусы', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(studentTemplate(1234567)).equal(result);
  });
});

describe('CHANNEL_HELPDESK реф бонус', () => {
  it('1234567 Отмените пожалуйста начисление по реф программе', async function() {
    payload.text = this.test?.title || '';
    payload.channel = CHANNEL_HELPDESK;
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(greetings() + studentTemplate(1234567)).equal(result);
  });
  it('1234567 Добавить бонусные уроки по реф программе обеим У.', async function() {
    payload.text = this.test?.title || '';
    payload.channel = CHANNEL_HELPDESK;
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(greetings() + studentTemplate(1234567) + MENTION_OLEG).equal(result);
  });
  it('1234567 Нужно начислить реф. бонусы', async function() {
    payload.text = this.test?.title || '';
    payload.channel = CHANNEL_HELPDESK;
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(greetings() + studentTemplate(1234567) + MENTION_OLEG).equal(result);
  });
  it('1234567, начислите пожалуйста рефералку', async function() {
    payload.text = this.test?.title || '';
    payload.channel = CHANNEL_HELPDESK;
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(greetings() + studentTemplate(1234567) + MENTION_OLEG).equal(result);
  });
  it('1234567 просят активировать реферальную программу', async function() {
    payload.text = this.test?.title || '';
    payload.channel = CHANNEL_HELPDESK;
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(greetings() + studentTemplate(1234567) + MENTION_OLEG).equal(result);
  });
  it('1234567 пригласил У 1234568\n Ждут реф неделю', async function() {
    payload.text = this.test?.title || '';
    payload.channel = CHANNEL_HELPDESK;
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(greetings() + studentTemplate(1234567) + studentTemplate(1234568) + MENTION_OLEG).equal(result);
  });
  it('1234567 пришел от 12345678. Установите, пожалуйста, реферальную программу', async function() {
    payload.text = this.test?.title || '';
    payload.channel = CHANNEL_HELPDESK;
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(greetings() + studentTemplate(1234567) + studentTemplate(12345678) + MENTION_OLEG).equal(result);
  });
  it('Ждут реф неделю', async function() {
    payload.text = this.test?.title || '';
    payload.channel = CHANNEL_HELPDESK;
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(greetings()).equal(result);
  });
});
describe('студент в ссылке', () => {
  it('persons/12345678/services/12345679', async function() {
    payload.text = this.test?.title || '';
    payload.channel = '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(studentTemplate(12345678)).equal(result);
  });
  it('https://fly.customer.io/env/40281/people/1234567', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(studentTemplate(1234567)).equal(result);
  });
  it('https://skyeng.slack.com/archives/CHPJHAXPZ/p1600848092.021800 1234567', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(studentTemplate(1234567)).equal(result);
  });
  it('student_id=1234567&teacher_id=7654321', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(studentTemplate(1234567) + teacherTemplate(7654321)).equal(result);
  });
  it('1234567 record/223-592980/189327171#message_id_189327171', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(studentTemplate(1234567)).equal(result);
  });
  it('12345678 p1594304604116600?thread_ts=1594303884.114500', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(studentTemplate(12345678)).equal(result);
  });
  it('ru/admin/educationServiceId/view/11111111 ru/persons/12345678/services/11111111', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(result).equal(studentTemplate(12345678));
  });
});
