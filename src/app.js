import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import { read, write } from './tools/json-files.js';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(bodyParser.json());

// Set up JWT secret key
const SECRET_KEY = '12345';

// Function to authenticate user
async function authenticateUser(username, password) {
    const users = await read('data/users.json');
    const user = users.find(u => u.username === username && u.password === password);
    return user || null;
}

// Middleware to verify JWT token
function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(400).json({ message: 'Invalid token.' });
    }
}

// POST /authenticate - authenticate and provide JWT token
app.post('/authenticate', async (req, res) => {
    const { username, password } = req.body;
    const user = await authenticateUser(username, password);

    if (user) {
        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
        return res.json({ token });
    }

    res.status(401).json({ message: 'Invalid username or password' });
});

// GET /questions - retrieve all questions
app.get('/questions', async (req, res) => {
    const questions = await read('data/questions.json');
    const questionsList = questions.map(({ id, question, options }) => ({ id, question, options }));
    res.json(questionsList);
});

// GET /questions/:questionId - retrieve a specific question by UUID
app.get('/questions/:questionId', async (req, res) => {
    const { questionId } = req.params;
    const questions = await read('data/questions.json');
    const question = questions.find(q => q.id === questionId);

    if (!question) {
        return res.status(404).json({ message: 'Question not found' });
    }

    const { id, question: text, options } = question;
    res.json({ id, question: text, options });
});

// POST /game-runs - create a new game run
app.post('/game-runs', verifyToken, async (req, res) => {
    const userName = req.user.username;
    const newRun = {
        id: uuidv4(),
        userName,
        createdAt: Math.floor(Date.now() / 1000),
        responses: {}
    };

    const gameRuns = await read('data/game-runs.json');
    gameRuns.push(newRun);
    await write('data/game-runs.json', gameRuns);

    res.json({ runId: newRun.id });
});

// PUT /game-runs/:runId/responses - submit a response to a specific question
app.put('/game-runs/:runId/responses', verifyToken, async (req, res) => {
    const { runId } = req.params;
    const { questionId, answerIndex } = req.body;
    const userName = req.user.username;

    const gameRuns = await read('data/game-runs.json');
    const runIndex = gameRuns.findIndex(run => run.id === runId && run.userName === userName);

    if (runIndex === -1) {
        return res.status(404).json({ message: 'Game run not found or not owned by user' });
    }

    const run = gameRuns[runIndex];
    run.responses[questionId] = answerIndex;
    await write('data/game-runs.json', gameRuns);

    res.status(200).json({ message: 'Response submitted' });
});

// GET /game-runs/:runId/results - retrieve the results of a specific game run
app.get('/game-runs/:runId/results', verifyToken, async (req, res) => {
    const { runId } = req.params;
    const userName = req.user.username;

    const gameRuns = await read('data/game-runs.json');
    const run = gameRuns.find(run => run.id === runId && run.userName === userName);

    if (!run) {
        return res.status(404).json({ message: 'Game run not found or not owned by user' });
    }

    const questions = await read('data/questions.json');
    const results = {};

    for (const [questionId, answerIndex] of Object.entries(run.responses)) {
        const question = questions.find(q => q.id === questionId);
        if (question) {
            results[questionId] = question.correctAnswer === answerIndex;
        }
    }

    res.json({
        id: run.id,
        createdAt: run.createdAt,
        userName: run.userName,
        responses: results
    });
});

export default app;
