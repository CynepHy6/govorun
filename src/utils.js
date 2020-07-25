"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterRepeated = exports.formatTs = void 0;
const formatter = new Intl.DateTimeFormat('ru', {
    timeZone: 'Europe/Moscow',
    hour12: false,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
});
function formatTs(ts) {
    return formatter.format(new Date(+ts * 1000));
}
exports.formatTs = formatTs;
function filterRepeated(arr) {
    return [...new Set(arr)];
}
exports.filterRepeated = filterRepeated;
