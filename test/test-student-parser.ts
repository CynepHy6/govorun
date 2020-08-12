import {payload, studentTemplate, teacherTemplate} from './utils-test';
import {buildResponse} from '../src/parser';

const expect = require('chai').expect;
console.log = () => {};

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
    expect(studentTemplate(10148852) + '<@UJAGQRJM8> fyi').equal(result);
  });

  it('12345678 123-123456 123123-123456-123456 123123-123456-', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(studentTemplate(12345678)).equal(result);
  });
  it('12345678 p1594304604116600?thread_ts=1594303884.114500', async function() {
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
  it('1234567 РУ', async function() {
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
});
