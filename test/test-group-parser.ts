import {payload} from '../src/stubs';
import {buildResponse} from '../src/parser';

const expect = require('chai').expect;
console.log = () => {};
const group = (id: number) => `<https://crm.skyeng.ru/admin/group/edit?id=${id}|группа ${id}> \n`;

describe('упоминание группы', () => {
  it('айди', async function() {
    payload.text = '1234';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(group(1234)).equal(result);
  });
  describe('спец', () => {
    it('Г имя', async function() {
      payload.text = '1832 степа';
      const [result] = await Promise.all([buildResponse(payload)]);
      expect(group(1832) + '<@UJAGQRJM8> fyi').equal(result);
    });
    it('Г \\n имя', async function() {
      payload.text = '1832 \n abracadabra степа';
      const [result] = await Promise.all([buildResponse(payload)]);
      expect(group(1832) + '<@UJAGQRJM8> fyi').equal(result);
    });
    it('имя Г', async function() {
      payload.text = 'степа 1832';
      const [result] = await Promise.all([buildResponse(payload)]);
      expect(group(1832) + '<@UJAGQRJM8> fyi').equal(result);
    });
    it('имя \\n Г', async function() {
      payload.text = 'степа \n abracadabra 1832';
      const [result] = await Promise.all([buildResponse(payload)]);
      expect(group(1832) + '<@UJAGQRJM8> fyi').equal(result);
    });
  });
});

