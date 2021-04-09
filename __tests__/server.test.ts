import request from "supertest";
import server from "../src/server";

afterEach((done) => {
  server.close();
  done();
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
    });
  });
});
