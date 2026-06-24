const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const taskController = require('../controllers/taskController');

// @route   GET /api/tasks
router.get('/', auth, taskController.getAllTasks);

// @route   GET /api/tasks/board/:boardId
router.get('/board/:boardId', auth, taskController.getTasksByBoard);

// @route   POST /api/tasks
router.post('/', auth, taskController.createTask);

// @route   PUT /api/tasks/:id
router.put('/:id', auth, taskController.updateTask);

// @route   DELETE /api/tasks/:id
router.delete('/:id', auth, taskController.deleteTask);

// @route   POST /api/tasks/suggest-estimate
router.post('/suggest-estimate', auth, taskController.suggestEstimate);

module.exports = router;
