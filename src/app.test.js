import request from 'supertest';
import app from './app.js';

describe('API Endpoints', () => {
    let token;

    beforeAll(async () => {
        
        const response = await request(app)
            .post('/authenticate')
            .send({ username: 'testuser', password: 'password' });
        token = response.body.token;
    });

    test('POST /authenticate', async () => {
        const response = await request(app)
            .post('/authenticate')
            .send({ username: 'testuser', password: 'password' });
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('token');
    });

    test('GET /questions', async () => {
        const response = await request(app).get('/questions');
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });

    test('GET /questions/:questionId', async () => {
        const response = await request(app).get('/questions/some-question-id');
        expect(response.statusCode).toBeOneOf([200, 404]);
    });

    test('POST /game-runs', async () => {
        const response = await request(app)
            .post('/game-runs')
            .set('Authorization', `Bearer ${token}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('runId');
    });

    test('PUT /game-runs/:runId/responses', async () => {
        const runId = 'some-run-id';
        const questionId = 'some-question-id';
        const answerIndex = 0;

        const response = await request(app)
            .put(`/game-runs/${runId}/responses`)
            .set('Authorization', `Bearer ${token}`)
            .send({ questionId, answerIndex });
        expect(response.statusCode).toBe(200);
    });

    test('GET /game-runs/:runId/results', async () => {
        const runId = 'some-run-id';

        const response = await request(app)
            .get(`/game-runs/${runId}/results`)
            .set('Authorization', `Bearer ${token}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('responses');
    });
});
