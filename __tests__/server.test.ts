import request from "supertest";
import server from "../src/server";

afterEach((done) => {
  server.close();
  done();
});

describe("POST /api/users", () => {
  test("should create a new User resource", async () => {
    const response = await request(server).post("/api/users").send({
      username: "ms",
      name: "Mary Smith",
      email: "mary.smith@protonmail.com",
      password: "456",
    });

    expect(response.status).toEqual(201);
    expect(response.type).toEqual("application/json");
    expect(response.body).toEqual({
      id: 2,
      username: "ms",
    });
  });
});

describe("GET /api/users", () => {
  test("should return all User resources", async () => {
    const response = await request(server).get("/api/users");

    expect(response.status).toEqual(200);
    expect(response.type).toEqual("application/json");
    expect(response.body).toEqual({
      "1": {
        id: 1,
        username: "jd",
      },
      "2": {
        id: 2,
        username: "ms",
      },
    });
  });
});
