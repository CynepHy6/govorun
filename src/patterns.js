"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXCLUDED = exports.GROUP = exports.TEACHER = exports.STUDENT = void 0;
exports.STUDENT = '\\s*(у|лк|student_id=|people\\/)\\s*\\-?\\.?\\s*';
exports.TEACHER = '\\s*(п|teacher_id=)\\s*';
exports.GROUP = '\\s*г(рупп.?|р)?\\.?\\s*';
exports.EXCLUDED = '\\d{4}[.-]\\d{1,2}[.-]\\d{1,2}' +
    '|\\d{1,2}[.-]\\d{1,2}[.-]\\d{4}' +
    '|tickets\\/\\d+' +
    '|details\\/\\d+' +
    '|(\\d+-)+\\d*|-\\d+';
