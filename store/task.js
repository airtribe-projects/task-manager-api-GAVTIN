const data = require("../task.json");

// Deep-clone so the original JSON file is never mutated
let tasks = data.tasks.map((t) => ({ ...t }));

// nextId starts after the highest existing id — safe regardless of order
let nextId = Math.max(...tasks.map((t) => t.id)) + 1;

const taskStore = {
  getAll() {
    return tasks;
  },

  getById(id) {
    return tasks.find((t) => t.id === id) || null;
  },

  create({ title, description, completed }) {
    const task = {
      id: nextId++,
      title,
      description,
      completed,
    };
    tasks.push(task);
    return task;
  },

  update(id, { title, description, completed }) {
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    tasks[idx] = { id, title, description, completed };
    return tasks[idx];
  },

  delete(id) {
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    tasks.splice(idx, 1);
    return true;
  },
};

module.exports = taskStore;