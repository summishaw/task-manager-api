const test = require('node:test');
const assert = require('node:assert/strict');

test('Node.js test runner is working', () => {
assert.equal(1 + 1, 2);
});

test('Task API endpoints are defined', () => {
const fs = require('node:fs');
const serverCode = fs.readFileSync('server.js', 'utf8');

assert.match(serverCode, /GET|app.get/);
assert.match(serverCode, /POST|app.post/);
assert.match(serverCode, /PUT|app.put/);
assert.match(serverCode, /DELETE|app.delete/);
});
