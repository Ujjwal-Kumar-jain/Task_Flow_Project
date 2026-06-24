const Task = require('../models/Task');
const Board = require('../models/Board');
const { GoogleGenAI } = require('@google/genai');

// @route   GET /api/tasks
// @desc    Get all tasks for logged in user (across all boards)
// @access  Private
exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ owner: req.user.id }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/tasks/board/:boardId
// @desc    Get all tasks for a specific board
// @access  Private
exports.getTasksByBoard = async (req, res) => {
    try {
        // Check if board exists and user owns it
        const board = await Board.findById(req.params.boardId);
        if (!board) {
            return res.status(404).json({ msg: 'Board not found' });
        }
        if (board.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const tasks = await Task.find({ board: req.params.boardId }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   POST /api/tasks
// @desc    Create a task
// @access  Private
exports.createTask = async (req, res) => {
    try {
        const { title, description, status, priority, dueDate, estimatedEffort, boardId } = req.body;

        if (!title || !boardId) {
            return res.status(400).json({ msg: 'Title and boardId are required' });
        }

        // Verify board ownership
        const board = await Board.findById(boardId);
        if (!board || board.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized for this board' });
        }

        const newTask = new Task({
            title,
            description,
            status: status || 'To Do',
            priority: priority || 'Medium',
            dueDate,
            estimatedEffort,
            board: boardId,
            owner: req.user.id
        });

        const task = await newTask.save();
        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
exports.updateTask = async (req, res) => {
    try {
        const { title, description, status, priority, dueDate, estimatedEffort } = req.body;

        let task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ msg: 'Task not found' });
        }

        if (task.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        task.title = title || task.title;
        task.description = description !== undefined ? description : task.description;
        task.status = status || task.status;
        task.priority = priority || task.priority;
        task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;
        task.estimatedEffort = estimatedEffort !== undefined ? estimatedEffort : task.estimatedEffort;

        await task.save();
        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ msg: 'Task not found' });
        }

        if (task.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await Task.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Task removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   POST /api/tasks/suggest-estimate
// @desc    AI Suggest Estimate Endpoint
// @access  Private
exports.suggestEstimate = async (req, res) => {
    try {
        const { title, description } = req.body;
        
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
            return res.status(503).json({ 
                msg: 'AI service unavailable. Missing API Key.' 
            });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const prompt = `
        You are a project management assistant. 
        I have a task with the title: "${title}"
        And description: "${description || 'No description provided'}"
        
        Please estimate how much effort this task will take (e.g. "2 hours", "1 day", or "S/M/L").
        Also suggest a reasonable due date. Today's date is ${new Date().toISOString().split('T')[0]}.
        
        Return your response ONLY as a JSON object with this exact format:
        {
          "estimatedEffort": "your estimate here",
          "suggestedDueDate": "YYYY-MM-DD",
          "reasoning": "a short 1 sentence reason"
        }
        Do not include markdown blocks or any other text.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const aiText = response.text;
        // Clean up markdown if AI added it
        const jsonStr = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
        const result = JSON.parse(jsonStr);

        res.json(result);
    } catch (err) {
        console.error("AI Error:", err.message);
        res.status(500).json({ msg: 'Failed to generate estimate. The AI service might be down or returning invalid data.', error: err.message });
    }
};
