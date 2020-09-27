import {buildResponse} from '../src/parser';
import {groupTemplate, MENTION, payload, studentTemplate} from './utils-test';

const expect = require('chai').expect;
console.log = () => {};

describe('группа', () => {
  describe('спец', () => {
    it('2348 степа', async function() {
      payload.text = this.test?.title || '';
      const [result] = await Promise.all([buildResponse(payload)]);
      expect(groupTemplate(2348) + MENTION).equal(result);
    });
    it('2348 \n abracadabra степа', async function() {
      payload.text = this.test?.title || '';
      const [result] = await Promise.all([buildResponse(payload)]);
      expect(groupTemplate(2348) + MENTION).equal(result);
    });
    it('степа 2348', async function() {
      payload.text = this.test?.title || '';
      const [result] = await Promise.all([buildResponse(payload)]);
      expect(groupTemplate(2348) + MENTION).equal(result);
    });
    it('степа \n abracadabra 2348', async function() {
      payload.text = this.test?.title || '';
      const [result] = await Promise.all([buildResponse(payload)]);
      expect(groupTemplate(2348) + MENTION).equal(result);
    });
  });
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
  it('31 июля 2020 г., 12:28 1234', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(groupTemplate(1234)).equal(result);
  });
  it('1234 1235.00', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(groupTemplate(1234)).equal(result);
  });
  it('У 12345678 группа 1234', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(studentTemplate(12345678) + groupTemplate(1234)).equal(result);
  });
});

