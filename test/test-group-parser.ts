import {payload} from './stubs';
import {buildResponse} from '../src/parser';

const expect = require('chai').expect;
console.log = () => {};
const group = (id: number) => `<https://crm.skyeng.ru/admin/group/edit?id=${id}|группа ${id}> \n`;

describe('упоминание группы', () => {
  it('1234', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(group(1234)).equal(result);
  });
  it('1234. .1235', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(group(1234) + group(1235)).equal(result);
  });
  it('1234_ _1235', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(group(1234) + group(1235)).equal(result);
  });

  describe('спец', () => {
    it('1832 степа', async function() {
      payload.text = this.test?.title || '';
      const [result] = await Promise.all([buildResponse(payload)]);
      expect(group(1832) + '<@UJAGQRJM8> fyi').equal(result);
    });
    it('1832 \n abracadabra степа', async function() {
      payload.text = this.test?.title || '';
      const [result] = await Promise.all([buildResponse(payload)]);
      expect(group(1832) + '<@UJAGQRJM8> fyi').equal(result);
    });
    it('степа 1832', async function() {
      payload.text = this.test?.title || '';
      const [result] = await Promise.all([buildResponse(payload)]);
      expect(group(1832) + '<@UJAGQRJM8> fyi').equal(result);
    });
    it('степа \n abracadabra 1832', async function() {
      payload.text = this.test?.title || '';
      const [result] = await Promise.all([buildResponse(payload)]);
      expect(group(1832) + '<@UJAGQRJM8> fyi').equal(result);
    });
  });
});

