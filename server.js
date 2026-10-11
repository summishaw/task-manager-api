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

// Update an existing task
app.put("/tasks/:id", (req, res) => {
  if (!/^[1-9]\d*$/.test(req.params.id)) {
  return res.status(400).json({ error: "Invalid task ID" });
}
const id = Number(req.params.id);
  const task = tasks.find((task) => task.id === id);

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  const { title, completed } = req.body;

  // Validate all provided fields before changing the task
  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        error: "Title must be a non-empty string"
      });
    }
  }

  if (completed !== undefined) {
    if (typeof completed !== "boolean") {
      return res.status(400).json({
        error: "Completed must be a boolean"
      });
    }
  }

  // Apply updates only after all validation passes
  if (title !== undefined) {
    task.title = title.trim();
  }

  if (completed !== undefined) {
    task.completed = completed;
  }

  res.json(task);
});

// Delete an existing task
app.delete("/tasks/:id", (req, res) => {
  if (!/^[1-9]\d*$/.test(req.params.id)) {
  return res.status(400).json({ error: "Invalid task ID" });
}
const id = Number(req.params.id);
  const index = tasks.findIndex((task) => task.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  tasks.splice(index, 1);
  res.status(204).send();
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

if (require.main === module) {
app.listen(PORT, () => {
console.log("Server running on port ${PORT}");
});
}

module.exports = app;
