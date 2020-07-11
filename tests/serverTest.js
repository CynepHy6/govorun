"use strict";
exports.__esModule = true;
var helper_1 = require("./helper");
var server_1 = require("../src/server");
function testGroupParse() {
    helper_1.payloadStub.text = '2222';
    var res = server_1.buildResponse(helper_1.payloadStub);
    console.log(Promise.all([res]));
}
testGroupParse();
