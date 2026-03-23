const express = require('express');
const router = express.Router();
const taskStore = require('../store/task');

// ── Validation helpers ─────────────────────────────────────────────────────

/**
 * Validates the three required fields for creating or updating a task.
 * Returns an array of error strings (empty = valid).
 */
function validateTaskBody({ title, description, completed, priority }, requireAll = true) {
  const errors = [];

  if (requireAll || title !== undefined) {
    if (!title || typeof title !== 'string' || !title.trim()) {
      errors.push('title is required and must be a non-empty string');
    }
  }

  if (requireAll || description !== undefined) {
    if (description === undefined || typeof description !== 'string') {
      errors.push('description is required and must be a string');
    }
  }

  if (requireAll || completed !== undefined) {
    if (completed === undefined) {
      errors.push('completed is required');
    } else if (typeof completed !== 'boolean') {
      errors.push('completed must be a boolean');
    }
  }

  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    errors.push(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }

  return errors;
};

// ── Routes ────

// GET /tasks
// GET /tasks?completed=true&sort=asc
router.get('/', (req, res) => {
  const { completed, sort } = req.query;

  // Validate sort value if provided
  if (sort && !['asc', 'desc'].includes(sort)) {
    return res.status(400).json({ error: 'sort must be "asc" or "desc"' });
  }

  const tasks = taskStore.getAll({ completed, sort });
  res.status(200).json(tasks);
});

// GET /tasks/priority/:level  — must be defined BEFORE /:id
// otherwise Express matches "priority" as the :id param
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

// POST /tasks
router.post('/', (req, res) => {
  const errors = validateTaskBody(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const { title, description, completed, priority } = req.body;
  const task = taskStore.create({ title, description, completed, priority });
  res.status(201).json(task);
});

// PUT /tasks/:id
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'id must be a number' });

  const errors = validateTaskBody(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const existing = taskStore.getById(id);
  if (!existing) return res.status(404).json({ error: 'Task not found' });

  const { title, description, completed, priority } = req.body;
  const updated = taskStore.update(id, { title, description, completed, priority });
  res.status(200).json(updated);
});

// DELETE /tasks/:id
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'id must be a number' });

  const deleted = taskStore.delete(id);
  if (!deleted) return res.status(404).json({ error: 'Task not found' });

  res.status(200).json({ message: 'Task deleted successfully' });
});

module.exports = router;
