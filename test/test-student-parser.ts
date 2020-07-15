import {payload} from '../src/stubs';
import {buildResponse} from '../src/parser';

const expect = require('chai').expect;
const log = console.log;
console.log = () => {};
const student = (id: number) => `${id}: <https://grouplessons-api.skyeng.ru/admin/student/view/${id}|KGL>` +
    ` | <https://id.skyeng.ru/admin/users/${id}|ID> | <https://fly.customer.io/env/40281/people/${id}|customer> \n`;
const teacher = (id: number) => `${id}:  <https://id.skyeng.ru/admin/users/${id}|ID> \n`;

describe('упоминание студента', () => {
  it('#', async function() {
    payload.text = '12345678';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(student(12345678)).equal(result);
  });
  it('У', async function() {
    payload.text = 'у12345678';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(student(12345678)).equal(result);
  });
  it('ЛК', async function() {
    payload.text = 'лк12345678';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(student(12345678)).equal(result);
  });
  it('У + #', async function() {
    payload.text = 'у12345678 99999999';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(student(12345678) + student(99999999)).equal(result);
  });

  it('У У + #', async function() {
    payload.text = 'у12345678 12345678 99999999';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(student(12345678) + student(99999999)).equal(result);
  });

  it('У У + # + П', async function() {
    payload.text = 'у 12345678 П 12345678 99999999';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(student(99999999) + teacher(12345678)).equal(result);
  });

  it('спец # добавляет тег', async function() {
    payload.text = '10148852';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(student(10148852) + '<@UJAGQRJM8> fyi').equal(result);
  });

  it('# + -#', async function() {
    payload.text = '12345678 123-123456 123123-123456-123456 123123-123456-';
    const [result] = await Promise.all([buildResponse(payload)]);
    log(result)
    expect(student(12345678)).equal(result);
  });
  it('# + .#', async function() {
    payload.text = '12345678 p1594304604116600?thread_ts=1594303884.114500';
    const [result] = await Promise.all([buildResponse(payload)]);
    log(result)
    expect(student(12345678)).equal(result);
  });
  it('# + @#', async function() {
    payload.text = '12345678 1234566@mail.ru';
    const [result] = await Promise.all([buildResponse(payload)]);
    log(result)
    expect(student(12345678)).equal(result);
  });
  it('# + pageId=#', async function() {
    payload.text = '12345678 pageId=777777';
    const [result] = await Promise.all([buildResponse(payload)]);
    log(result)
    expect(student(12345678)).equal(result);
  });
});
