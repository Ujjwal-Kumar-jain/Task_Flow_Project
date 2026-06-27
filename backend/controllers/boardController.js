const Board = require('../models/Board');
const Task = require('../models/Task');

// @route   GET /api/boards
// @desc    Get all boards for logged in user
// @access  Private
exports.getBoards = async (req, res) => {
    try {
        const boards = await Board.find({ owner: req.user.id }).sort({ createdAt: -1 });
        res.json(boards);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   POST /api/boards
// @desc    Create a new board
// @access  Private
exports.createBoard = async (req, res) => {
    try {
        const { title, description, category, collaborators } = req.body;

        if (!title) {
            return res.status(400).json({ msg: 'Title is required' });
        }

        const newBoard = new Board({
            title,
            description,
            category: category || 'Project Board',
            collaborators: collaborators || [],
            owner: req.user.id
        });

        const board = await newBoard.save();
        res.json(board);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/boards/:id
// @desc    Get a specific board
// @access  Private
exports.getBoardById = async (req, res) => {
    try {
        const board = await Board.findById(req.params.id);

        if (!board) {
            return res.status(404).json({ msg: 'Board not found' });
        }

        // Make sure user owns the board
        if (board.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        res.json(board);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   PUT /api/boards/:id
// @desc    Update a board
// @access  Private
exports.updateBoard = async (req, res) => {
    try {
        const { title, description, category, collaborators } = req.body;

        let board = await Board.findById(req.params.id);

        if (!board) {
            return res.status(404).json({ msg: 'Board not found' });
        }

        if (board.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        board.title = title || board.title;
        board.description = description !== undefined ? description : board.description;
        board.category = category !== undefined ? category : board.category;
        board.collaborators = collaborators !== undefined ? collaborators : board.collaborators;

        await board.save();
        res.json(board);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   DELETE /api/boards/:id
// @desc    Delete a board
// @access  Private
exports.deleteBoard = async (req, res) => {
    try {
        const board = await Board.findById(req.params.id);

        if (!board) {
            return res.status(404).json({ msg: 'Board not found' });
        }

        if (board.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await Board.findByIdAndDelete(req.params.id);
        
        // Also delete tasks associated with this board
        await Task.deleteMany({ board: req.params.id });

        res.json({ msg: 'Board removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
