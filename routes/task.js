const express = require('express');
const router = express.Router();
const taskStore = require('../store/task');

// ── Validation helpers ─────────────────────────────────────────────────────

/**
 * Validates the three required fields for creating or updating a task.
 * Returns an array of error strings (empty = valid).
 */
function validateTaskBody({ title, description, completed }) {
  const errors = [];

  if (title === undefined || typeof title !== 'string' || !title.trim()) {
    errors.push('title is required and must be a non-empty string');
  }

  if (description === undefined || typeof description !== 'string') {
    errors.push('description is required and must be a string');
  }

  // Key: the test sends completed: "true" (string) and expects 400
  if (completed === undefined) {
    errors.push('completed is required');
  } else if (typeof completed !== 'boolean') {
    errors.push('completed must be a boolean');
  }

  return errors;
}

// ── Routes ────

// GET /tasks
router.get('/', (req, res) => {
  const tasks = taskStore.getAll();
  res.status(200).json(tasks);
});

// GET /tasks/:id
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'id must be a number' });
  }

  const task = taskStore.getById(id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.status(200).json(task);
});

// POST /tasks
router.post('/', (req, res) => {
  const errors = validateTaskBody(req.body);

  if (errors.length) {
    return res.status(400).json({ errors });
  }

  const { title, description, completed } = req.body;
  const task = taskStore.create({ title, description, completed });
  res.status(201).json(task);
});

// PUT /tasks/:id
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'id must be a number' });
  }

  // Validate body before checking existence (400 beats 404)
  const errors = validateTaskBody(req.body);
  if (errors.length) {
    return res.status(400).json({ errors });
  }

  const existing = taskStore.getById(id);
  if (!existing) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const { title, description, completed } = req.body;
  const updated = taskStore.update(id, { title, description, completed });
  res.status(200).json(updated);
});

// DELETE /tasks/:id
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'id must be a number' });
  }

  const deleted = taskStore.delete(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.status(200).json({ message: 'Task deleted successfully' });
});

module.exports = router;
