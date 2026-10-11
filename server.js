const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let tasks = [];
let nextId = 1;

app.get("/", (req, res) => {
res.json({ message: "Task Manager API is running" });
});

app.get("/tasks", (req, res) => {
res.json(tasks);
});

app.post("/tasks", (req, res) => {
const { title } = req.body;

if (!title || typeof title !== "string" || !title.trim()) {
return res.status(400).json({
error: "Task title is required"
});
}

const task = {
id: nextId++,
title: title.trim(),
completed: false
};

tasks.push(task);
res.status(201).json(task);
});

app.use((req, res) => {
res.status(404).json({
error: "Route not found"
});
});

app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});
