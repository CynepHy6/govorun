import {buildResponse} from '../src/parser';
import {groupTemplate, payload, studentTemplate} from './utils-test';
import {CHANNEL_HELPDESK} from '../src/models';

const expect = require('chai').expect;
console.log = () => {
};

describe('группа', () => {
  it('1234', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(result).equal(groupTemplate(1234));
  });
  it('1234. .1235', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(result).equal(groupTemplate(1234) + groupTemplate(1235));
  });
  it('1111 1234р 1235 Р 1222 ₽', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(result).equal(groupTemplate(1111));
  });
  it('31 июля 2020 г., 12:28 1234', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(result).equal(groupTemplate(1234));
  });
  it('1234 1235.00', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(result).equal(groupTemplate(1234));
  });
  it('У 12345678 группа 1234', async function() {
    payload.text = this.test?.title || '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(result).equal(studentTemplate(12345678) + groupTemplate(1234));
  });
  it('1234 <@UQ0EUGQVA>', async function() {
    payload.text = this.test?.title || '';
    payload.channel = CHANNEL_HELPDESK;
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(result).equal(groupTemplate(1234));
  });
});
describe('не группа', () => {
  it('12345678 12345 руб., 12346руб.', async function() {
    payload.text = this.test?.title || '';
    payload.channel = '';
    const [result] = await Promise.all([buildResponse(payload)]);
    expect(result).equal(studentTemplate(12345678));
  });
});


