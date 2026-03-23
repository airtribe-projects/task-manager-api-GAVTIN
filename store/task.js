const data = require("../task.json");
// Possible Values of Added priorities
const VALID_PRIORITIES = ['low', 'medium', 'high'];
// Deep-clone so the original JSON file is never mutated
let tasks = data.tasks.map((t) => ({ ...t }));

// nextId starts after the highest existing id — safe regardless of order
let nextId = Math.max(...tasks.map((t) => t.id)) + 1;

const taskStore = {
  getAll({ completed, sort } = {}) {
    let result = [...tasks];

    // Filter by completion status
    if (completed !== undefined) {
      // query param comes in as string "true"/"false" — normalising it
      const isCompleted = completed === 'true' || completed === true;
      result = result.filter((t) => t.completed === isCompleted);
    }

    // Sort by createdAt — "asc" / "desc" order
    if (sort === 'asc') {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sort === 'desc') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return result;
  },

  getByPriority(level) {
    return tasks.filter((t) => t.priority === level);
  },

  getById(id) {
    return tasks.find((t) => t.id === id) || null;
  },

  create({ title, description, completed, priority = 'medium' }) {
    const task = {
      id: nextId++,
      title,
      description,
      completed,
      priority,
      createdAt: new Date().toISOString(),
    };
    tasks.push(task);
    return task;
  },

  update(id, { title, description, completed, priority }) {
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    tasks[idx] = {
      ...tasks[idx],
      id,
      title,
      description,
      completed,
      priority,
    };
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