const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const boardController = require('../controllers/boardController');

// @route   GET /api/boards
router.get('/', auth, boardController.getBoards);

// @route   POST /api/boards
router.post('/', auth, boardController.createBoard);

// @route   GET /api/boards/:id
router.get('/:id', auth, boardController.getBoardById);

// @route   PUT /api/boards/:id
router.put('/:id', auth, boardController.updateBoard);

// @route   DELETE /api/boards/:id
router.delete('/:id', auth, boardController.deleteBoard);

module.exports = router;
