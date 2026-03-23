const express = require('express');
const router = express.Router();
const taskStore = require('../store/task');

const VALID_PRIORITIES = taskStore.VALID_PRIORITIES;
const VALID_SORT_VALUES = ['asc', 'desc'];

// ── Validation ─────────────────────────────────────────────────────────────

// POST route enforces required fields separately at the route level.
function validateTaskBody({ title, description, completed, priority }) {
  const errors = [];

  if (title !== undefined) {
    if (typeof title !== 'string' || !title.trim()) {
      errors.push('title must be a non-empty string');
    }
  }

  if (description !== undefined) {
    if (typeof description !== 'string') {
      errors.push('description must be a string');
    }
  }

  if (completed !== undefined) {
    if (typeof completed !== 'boolean') {
      errors.push('completed must be a boolean');
    }
  }

  if (priority !== undefined) {
    if (!VALID_PRIORITIES.includes(priority)) {
      errors.push(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
    }
  }

  return errors;
}

// ── Routes ─────────────────────────────────────────────────────────────────

// GET /tasks?completed=true|false&sort=asc|desc
router.get('/', (req, res) => {
  const { completed, sort } = req.query;

  // Validate completed param
  if (completed !== undefined && !['true', 'false'].includes(completed)) {
    return res.status(400).json({
      error: 'completed must be "true" or "false"',
    });
  }

  if (
    sort !== undefined &&
    !VALID_SORT_VALUES.includes(sort.toLowerCase().trim())
  ) {
    return res.status(400).json({
      error: `sort must be one of: ${VALID_SORT_VALUES.join(', ')}. Received "${sort}"`,
    });
  }

  const tasks = taskStore.getAll({ completed, sort });
  res.status(200).json(tasks);
});

// GET /tasks/priority/:level — must be defined BEFORE /:id
router.get('/priority/:level', (req, res) => {
  const { level } = req.params;

  if (!VALID_PRIORITIES.includes(level)) {
    return res.status(400).json({
      error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}`,
    });
  }

  const tasks = taskStore.getByPriority(level);
  res.status(200).json(tasks);
});

// GET /tasks/:id
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'id must be a number' });
  }

  const task = taskStore.getById(id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  res.status(200).json(task);
});

// POST /tasks — title, description, completed are required
router.post('/', (req, res) => {
  const { title, description, completed } = req.body;

  // Enforce required fields explicitly before type validation
  const missing = [];
  if (title === undefined)       missing.push('title is required');
  if (description === undefined) missing.push('description is required');
  if (completed === undefined)   missing.push('completed is required');

  if (missing.length) {
    return res.status(400).json({ errors: missing });
  }

  // Validate types of all provided fields
  const errors = validateTaskBody(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const task = taskStore.create({
    title,
    description,
    completed,
    priority: req.body.priority,
  });
  res.status(201).json(task);
});

// PUT /tasks/:id — all fields optional, only validates what is sent
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'id must be a number' });

  const errors = validateTaskBody(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const existing = taskStore.getById(id);
  if (!existing) return res.status(404).json({ error: 'Task not found' });

  const updated = taskStore.update(id, req.body);
  res.status(200).json(updated);
});

// DELETE /tasks/:id — uses renamed store method taskStore.remove()
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'id must be a number' });

  // FIX 2: taskStore.remove() instead of taskStore.delete()
  const removed = taskStore.remove(id);
  if (!removed) return res.status(404).json({ error: 'Task not found' });

  res.status(200).json({ message: 'Task deleted successfully' });
});

module.exports = router;
