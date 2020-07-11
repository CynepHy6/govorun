import {payloadStub} from './helper';
import {buildResponse} from '../src/server';

function testGroupParse() {
  payloadStub.text = '2222';
  const res = buildResponse(payloadStub);
  console.log(Promise.all([res]))
}

testGroupParse();
