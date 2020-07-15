export const STUDENT = '\\s*(у|лк|student_id=|people\\/)\\s*\\-?\\.?\\s*';
export const TEACHER = '\\s*(п|teacher_id=)\\s*';
export const GROUP = '\\s*г(рупп.?|р)?\\.?\\s*';
export const EXCLUDED = '\\d{4}[.-]\\d{1,2}[.-]\\d{1,2}' +
    '|\\d{1,2}[.-]\\d{1,2}[.-]\\d{4}' +
    '|tickets\\/\\d+' +
    '|details\\/\\d+' +
    '|(\\d+-)+\\d*|-\\d+'
;
