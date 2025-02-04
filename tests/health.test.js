const request = require("supertest");
const app = require("../app"); 
const { HealthCheck, sequelize } = require("../src/models/model"); 

let server;

beforeAll(async() => {
  server = app.listen(3000);
  await sequelize.authenticate();
});

afterAll(async () => {
  await sequelize.close();
  await server.close();
});

jest.mock("../src/models/model"); 

describe("Health Check API Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test("GET /healthz should return 200 OK", async () => {
    HealthCheck.create.mockResolvedValue({}); 
    const res = await request(app).get("/healthz");
    expect(res.status).toBe(200);
  });

  test("GET /healthz should return 503 if Database server is stopped", async () => {
    HealthCheck.create.mockRejectedValue(new Error("Database error"));
    const res = await request(app).get("/healthz");
    expect(res.status).toBe(503);
  });

  test("POST /healthz should return 405 Method Not Allowed", async () => {
    const res = await request(app).post("/healthz");
    expect(res.status).toBe(405);
  });

  test("PUT /healthz should return 405 Method Not Allowed", async () => {
    const res = await request(app).put("/healthz");
    expect(res.status).toBe(405);
  });

  test("DELETE /healthz should return 405 Method Not Allowed", async () => {
    const res = await request(app).delete("/healthz");
    expect(res.status).toBe(405);
  });

  test("PATCH /healthz should return 405 Method Not Allowed", async () => {
    const res = await request(app).patch("/healthz");
    expect(res.status).toBe(405);
  });

  test("GET /healthz with body should return 400 Bad Request", async () => {
    const res = await request(app).get("/healthz").send({ key: "value" });
    expect(res.status).toBe(400);
  });

  test("GET /healthz with query params should return 400 Bad Request", async () => {
    const res = await request(app).get("/healthz?param=value");
    expect(res.status).toBe(400);
  });


});
