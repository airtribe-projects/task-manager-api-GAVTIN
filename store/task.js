const data = require('../tasks.json');
// Possible Values of Added priorities
const VALID_PRIORITIES = ['low', 'medium', 'high'];
// Deep-clone so the original JSON file is never mutated
let tasks = data.tasks.map((t) => ({ ...t }));

// nextId starts after the highest existing id — safe regardless of order
let nextId = Math.max(...tasks.map((t) => t.id)) + 1;

const taskStore = {
  VALID_PRIORITIES,

  getAll({ completed, sort } = {}) {
    let result = [...tasks];

    // Filter by completion status
    if (completed !== undefined) {
      const isCompleted = completed === 'true' || completed === true;
      result = result.filter((t) => t.completed === isCompleted);
    }

    const normalisedSort =
      typeof sort === 'string' ? sort.toLowerCase().trim() : undefined;

    if (normalisedSort === 'asc') {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (normalisedSort === 'desc') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (normalisedSort !== undefined) {
      return { error: `sort must be "asc" or "desc", received "${sort}"` };
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

  // Strips undefined values so missing fields preserve their existing value.
  update(id, fields) {
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    const updatedFields = Object.fromEntries(
      Object.entries(fields).filter(([_, value]) => value !== undefined)
    );

    tasks[idx] = {
      ...tasks[idx],  
      ...updatedFields, 
      id,               
    };

    return tasks[idx];
  },

  remove(id) {
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    tasks.splice(idx, 1);
    return true;
  },
};

module.exports = taskStore;
