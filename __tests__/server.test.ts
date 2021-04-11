import http from "http";
import request from "supertest";
import { app, connectionPromise } from "../src/server";
import { Connection, Repository } from "typeorm";
import { User } from "../src/entities";

let connection: Connection;
let server: http.Server;

beforeEach(async () => {
  connection = await connectionPromise;
  console.log(
    `Establishing a connection (named "${connection.name}) to the DB - successful.`
  );

  const dropBeforeSync = true;
  await connection.synchronize(dropBeforeSync);
  console.log("Synchronizing the DB schema - successful.");

  const PORT_FOR_TESTING: number = 3001;
  server = app.listen(PORT_FOR_TESTING, async () => {
    console.log(`Server listening on port ${PORT_FOR_TESTING} ...`);
  });
});

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
    expect(response.headers.location).toEqual("/api/users/1");
    expect(response.type).toEqual("application/json");
    expect(response.body).toEqual({
      id: 1,
      username: "ms",
    });

    const usersRepository: Repository<User> = connection.getRepository(User);
    const users = await usersRepository.find();
    expect(users.length).toEqual(1);
    const { id, username, name, email, password } = users[0];
    expect({
      id,
      username,
      name,
      email,
      password,
    }).toEqual({
      id: 1,
      username: "ms",
      name: "Mary Smith",
      email: "mary.smith@protonmail.com",
      password: "456",
    });
  });
});

describe("GET /api/users", () => {
  test("should return all User resources", async () => {
    const response = await request(server).get("/api/users");

    expect(response.status).toEqual(200);
    expect(response.type).toEqual("application/json");
    expect(response.body).toEqual({
      users: [],
    });
  });
});
