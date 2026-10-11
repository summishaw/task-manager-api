const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server');

let server;
let baseUrl;

test.before(async () => {
server = app.listen(0);
await new Promise((resolve) => server.once('listening', resolve));
baseUrl = "http://127.0.0.1:${server.address().port}";
});

test.after(async () => {
await new Promise((resolve, reject) => {
server.close((err) => err ? reject(err) : resolve());
});
});

test('GET /tasks returns an array', async () => {
const res = await fetch("${baseUrl}/tasks");
assert.equal(res.status, 200);
assert.ok(Array.isArray(await res.json()));
});

test('POST /tasks creates a task and trims its title', async () => {
const res = await fetch("${baseUrl}/tasks", {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ title: '  Learn Node  ' })
});

assert.equal(res.status, 201);
assert.deepEqual(await res.json(), {
id: 1,
title: 'Learn Node',
completed: false
});
});

test('POST /tasks rejects invalid titles', async () => {
for (const body of [{}, { title: '' }, { title: '   ' }, { title: 123 }]) {
const res = await fetch("${baseUrl}/tasks", {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(body)
});
assert.equal(res.status, 400);
}
});

test('PUT /tasks/:id updates a task', async () => {
const created = await fetch("${baseUrl}/tasks", {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ title: 'Original' })
});
const task = await created.json();

const res = await fetch("${baseUrl}/tasks/${task.id}", {
method: 'PUT',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ title: ' Updated ', completed: true })
});

assert.equal(res.status, 200);
assert.deepEqual(await res.json(), {
id: task.id,
title: 'Updated',
completed: true
});
});

test('PUT rejects invalid IDs and fields without changing the task', async () => {
for (const id of ['0', '-1', '1.5', 'abc']) {
const res = await fetch("${baseUrl}/tasks/${id}", {
method: 'PUT',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ title: 'Changed' })
});
assert.equal(res.status, 400);
}

const created = await fetch("${baseUrl}/tasks", {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ title: 'Keep this' })
});
const task = await created.json();

for (const body of [
{ title: '' },
{ title: 123 },
{ completed: 'yes' }
]) {
const res = await fetch("${baseUrl}/tasks/${task.id}", {
method: 'PUT',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(body)
});
assert.equal(res.status, 400);
}

const list = await (await fetch("${baseUrl}/tasks")).json();
assert.equal(list.find((item) => item.id === task.id).title, 'Keep this');
});

test('PUT returns 404 for a nonexistent task', async () => {
const res = await fetch("${baseUrl}/tasks/99999", {
method: 'PUT',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ title: 'Missing' })
});
assert.equal(res.status, 404);
});

test('DELETE removes a task', async () => {
const created = await fetch("${baseUrl}/tasks", {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ title: 'Delete me' })
});
const task = await created.json();

const res = await fetch("${baseUrl}/tasks/${task.id}", {
method: 'DELETE'
});
assert.equal(res.status, 204);

const list = await (await fetch("${baseUrl}/tasks")).json();
assert.equal(list.some((item) => item.id === task.id), false);
});

test('DELETE rejects invalid IDs and nonexistent tasks', async () => {
for (const id of ['0', '-1', '1.5', 'abc']) {
const res = await fetch("${baseUrl}/tasks/${id}", {
method: 'DELETE'
});
assert.equal(res.status, 400);
}

const res = await fetch("${baseUrl}/tasks/99999", {
method: 'DELETE'
});
assert.equal(res.status, 404);
});

test('Unknown routes return 404', async () => {
const res = await fetch("${baseUrl}/unknown-route");
assert.equal(res.status, 404);
assert.deepEqual(await res.json(), { error: 'Route not found' });
});
