import {payload} from '../src/stubs';
import {buildResponse} from '../src/parser';

const expect = require('chai').expect;
console.log = () => {};
const student = (id: number) => `${id}: <https://grouplessons-api.skyeng.ru/admin/student/view/${id}|KGL>` +
    ` | <https://id.skyeng.ru/admin/users/${id}|ID> | <https://fly.customer.io/env/40281/people/${id}|customer> \n`;
const group = (id: number) => `<https://crm.skyeng.ru/admin/group/edit?id=${id}|группа ${id}> \n`;
const teacher = (id: number) => `П ${id}:  <https://id.skyeng.ru/admin/users/${id}|ID> \n`;

describe('упоминание группы', () => {
  it('айди', async function() {
    payload.text = '1234';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(group(1234)).equal(result);
  });
  describe('спец', () => {
    it('Г имя', async function() {
      payload.text = '1734 степа';
      const [result] = await Promise.all([buildResponse(payload)]);
      expect(group(1734) + '<@UJAGQRJM8> fyi').equal(result);
    });
    it('Г \\n имя', async function() {
      payload.text = '1734 \n abracadabra степа';
      const [result] = await Promise.all([buildResponse(payload)]);
      expect(group(1734) + '<@UJAGQRJM8> fyi').equal(result);
    });
    it('имя Г', async function() {
      payload.text = 'степа 1734';
      const [result] = await Promise.all([buildResponse(payload)]);
      expect(group(1734) + '<@UJAGQRJM8> fyi').equal(result);
    });
    it('имя \\n Г', async function() {
      payload.text = 'степа \n abracadabra 1734';
      const [result] = await Promise.all([buildResponse(payload)]);
      expect(group(1734) + '<@UJAGQRJM8> fyi').equal(result);
    });
  });
});

describe('упоминание студента', () => {
  it('айди', async function() {
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
    payload.text = 'лк 12345678';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(student(12345678)).equal(result);
  });
  it('У + айди', async function() {
    payload.text = 'у 12345678 99999999';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(student(12345678) + student(99999999)).equal(result);
  });

  it('У У + айди', async function() {
    payload.text = 'у 12345678 12345678 99999999';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(student(12345678) + student(99999999)).equal(result);
  });

  it('У У + айди + П', async function() {
    payload.text = 'у 12345678 П 12345678 99999999';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(student(99999999) + teacher(12345678)).equal(result);
  });

  it('спец У добавляет тег', async function() {
    payload.text = '10148852';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(student(10148852) + '<@UJAGQRJM8> fyi').equal(result);
  });
});
