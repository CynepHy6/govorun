import {buildResponse} from '../src/parser';
import {groupTemplate, payload, specMention} from './utils-test';

const expect = require('chai').expect;
console.log = () => {};

describe('группа', () => {
  it('1234', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(groupTemplate(1234)).equal(result);
  });
  it('1234. .1235', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(groupTemplate(1234) + groupTemplate(1235)).equal(result);
  });
  it('1111 1234р 1235 Р 1222 ₽', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(groupTemplate(1111)).equal(result);
  });

  describe('спец', () => {
    it('1832 степа', async function() {
      payload.text = this.test?.title || '';
      const [result] = await Promise.all([buildResponse(payload)]);
      expect(groupTemplate(1832) + specMention).equal(result);
    });
    it('1832 \n abracadabra степа', async function() {
      payload.text = this.test?.title || '';
      const [result] = await Promise.all([buildResponse(payload)]);
      expect(groupTemplate(1832) + specMention).equal(result);
    });
    it('степа 1832', async function() {
      payload.text = this.test?.title || '';
      const [result] = await Promise.all([buildResponse(payload)]);
      expect(groupTemplate(1832) + specMention).equal(result);
    });
    it('степа \n abracadabra 1832', async function() {
      payload.text = this.test?.title || '';
      const [result] = await Promise.all([buildResponse(payload)]);
      expect(groupTemplate(1832) + specMention).equal(result);
    });
  });
});

