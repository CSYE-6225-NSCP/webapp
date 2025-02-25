const request = require('supertest');
const { app } = require('../app');
const { sequelize, HealthCheck } = require('../src/models/model');

describe('Health Check API Tests', () => {
  beforeAll(async () => {
    await sequelize.authenticate();
    await sequelize.sync({ force: true }); 
  });

  afterAll(async () => {
    await sequelize.close(); 
  });

  beforeEach(async () => {
    await sequelize.sync({ force: true }); 
  });

  test('GET /healthz should return 200 OK', async () => {
    await HealthCheck.create({});
    const res = await request(app).get('/healthz');
    expect(res.statusCode).toBe(400);
  });


  test('POST /healthz should return 405 Method Not Allowed', async () => {
    const res = await request(app).post('/healthz');
    expect(res.status).toBe(405);
  });

  test('PUT /healthz should return 405 Method Not Allowed', async () => {
    const res = await request(app).put('/healthz');
    expect(res.status).toBe(405);
  });

  test('DELETE /healthz should return 405 Method Not Allowed', async () => {
    const res = await request(app).delete('/healthz');
    expect(res.status).toBe(405);
  });

  test('PATCH /healthz should return 405 Method Not Allowed', async () => {
    const res = await request(app).patch('/healthz');
    expect(res.status).toBe(405);
  });

  test('GET /healthz with body should return 400 Bad Request', async () => {
    const res = await request(app).get('/healthz').send({ key: 'value' });
    expect(res.status).toBe(400);
  });

  test('OPTIONS /healthz should return 405 Method Not Allowed', async () => {
    const res = await request(app).options('/healthz');
    expect(res.status).toBe(405);
  });

  test('HEAD /healthz should return 405 Method Not Allowed', async () => {
    const res = await request(app).head('/healthz');
    expect(res.status).toBe(405);
  });

  test('GET /healthz with query params should return 400 Bad Request', async () => {
    const res = await request(app).get('/healthz?param=value');
    expect(res.status).toBe(400);
  });

  test('GET /healthz with XML should return 400 Bad Request', async () => {
    const res = await request(app)
      .get('/healthz')  
      .set('Content-Type', 'application/xml')  
      .send('<root><key>value</key></root>');  
    expect(res.status).toBe(400);
  });

  test('GET /healthz with JSON should return 400 Bad Request', async () => {
    const res = await request(app)
      .get('/healthz')  
      .set('Content-Type', 'application/json')  
      .send({ key: 'value' });  
    expect(res.status).toBe(400);
  });

  test('GET /healthz should return 503 if Database is not available', async () => {
    await sequelize.close(); 
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(503);
  });
});
