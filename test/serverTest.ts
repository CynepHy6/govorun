import {payload} from '../src/stubs';
import {buildResponse} from '../src/parser';

const expect = require('chai').expect;

it('должно распарсить группу', async function() {
  payload.text = '2222';
  const [result] = await Promise.all([buildResponse(payload)]);
  expect(result).equal('<https://crm.skyeng.ru/admin/group/edit?id=2222|группа 2222> \n');
});
