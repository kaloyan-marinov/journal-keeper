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
  test(
    "if a client request doesn't include a 'Content-Type: application/json' header," +
      " the server should respond with a 400",
    async () => {
      const response = await request(server)
        .post("/api/users")
        .set("Content-Type", "text/html");

      expect(response.status).toEqual(400);
      expect(response.type).toEqual("application/json");
      expect(response.body).toEqual({
        error: "Your request did not include a 'Content-Type: application/json' header",
      });
    }
  );

  test(
    "if a client doesn't send all required fields," +
      " the server should respond with a 400",
    async () => {
      const completeUserPayload = {
        username: "jd",
        name: "John Doe",
        email: "john.doe@protonmail.com",
        password: "123",
      };

      interface IIncompleteUserPayload {
        [index: string]: string;
      }

      for (let field in completeUserPayload) {
        let incompleteUserPayload: IIncompleteUserPayload = { ...completeUserPayload };
        delete incompleteUserPayload[field];

        const response = await request(server)
          .post("/api/users")
          .send(incompleteUserPayload);

        expect(response.status).toEqual(400);
        expect(response.type).toEqual("application/json");
        expect(response.body).toEqual({
          error: `Your request body did not specify a '${field}'`,
        });
      }
    }
  );

  test(
    "if a client requests to create a new User resource," +
      " the server should create that resource",
    async () => {
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
    }
  );

  test(
    "if a client requests to create a new User resource" +
      " with a username which coincides with that of an existing User," +
      " the server should respond with a 400",
    async () => {
      const response1 = await request(server).post("/api/users").send({
        username: "jd",
        name: "John Doe",
        email: "john.doe@protonmail.com",
        password: "123",
      });

      const response2 = await request(server).post("/api/users").send({
        username: "jd",
        name: "different-name",
        email: "different-email",
        password: "different-password",
      });

      expect(response2.status).toEqual(400);
      expect(response2.type).toEqual("application/json");
      expect(response2.body).toEqual({
        error:
          "There already exists a User resource with the username that you provided",
      });

      const usersRepository: Repository<User> = connection.getRepository(User);
      const users: User[] = await usersRepository.find();
      expect(users.length).toEqual(1);
      expect(users[0].name).toEqual("John Doe");
    }
  );

  test(
    "if a client requests to create a new User resource" +
      " with an email which coincides with that of an existing User," +
      " the server should respond with a 400",
    async () => {
      const response1 = await request(server).post("/api/users").send({
        username: "jd",
        name: "John Doe",
        email: "john.doe@protonmail.com",
        password: "123",
      });

      const response2 = await request(server).post("/api/users").send({
        username: "different-username",
        name: "different-name",
        email: "john.doe@protonmail.com",
        password: "different-password",
      });

      expect(response2.status).toEqual(400);
      expect(response2.type).toEqual("application/json");
      expect(response2.body).toEqual({
        error: "There already exists a User resource with the email that you provided",
      });

      const usersRepository: Repository<User> = connection.getRepository(User);
      const users: User[] = await usersRepository.find();
      expect(users.length).toEqual(1);
      expect(users[0].name).toEqual("John Doe");
    }
  );
});

describe("GET /api/users", () => {
  test(
    "if a client requests all User resources but there are no User resources," +
      " the server should respond with an empty list",
    async () => {
      const response = await request(server).get("/api/users");

      expect(response.status).toEqual(200);
      expect(response.type).toEqual("application/json");
      expect(response.body).toEqual({
        users: [],
      });
    }
  );

  test(
    "if a client requests all User resources," +
      " the server should respond with public representations of all of them",
    async () => {
      const response1 = await request(server).post("/api/users").send({
        username: "jd",
        name: "John Doe",
        email: "john.doe@protonmail.com",
        password: "123",
      });

      const response2 = await request(server).get("/api/users");

      expect(response2.status).toEqual(200);
      expect(response2.type).toEqual("application/json");
      expect(response2.body).toEqual({
        users: [{ id: 1, username: "jd" }],
      });
    }
  );
});

describe("GET /api/users/:id", () => {
  test(
    "if a client specifies a non-existent User ID," +
      " the server should respond with a 404",
    async () => {
      const response = await request(server).get("/api/users/1");

      expect(response.status).toEqual(404);
      expect(response.type).toEqual("application/json");
      expect(response.body).toEqual({
        error: "There doesn't exist a User resource with an ID of 1",
      });
    }
  );

  test(
    "if a client specifies an existing User ID," +
      "the server should respond with (a public representation of) that User resource",
    async () => {
      const response1 = await request(server)
        .post("/api/users")
        .set("Content-Type", "application/json")
        .send({
          username: "jd",
          name: "John Doe",
          email: "john.doe@protonmail.com",
          password: "123",
        });

      const response2 = await request(server).get("/api/users/1");

      expect(response2.status).toEqual(200);
      expect(response2.type).toEqual("application/json");
      expect(response2.body).toEqual({
        id: 1,
        username: "jd",
      });
    }
  );
});
