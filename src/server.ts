import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import logger from "koa-logger";
import { Connection, createConnection } from "typeorm";

/* Introduce an in-memory database. */
interface IUser {
  id: number;
  username: string;
  name: string;
  email: string;
  password: string;
}

interface IPublicUser {
  id: number;
  username: string;
}

interface IUsers {
  [index: string]: IUser;
}

interface IPublicUsers {
  [index: string]: IPublicUser;
}

let users: IUsers = {
  1: {
    id: 1,
    username: "jd",
    name: "John Doe",
    email: "john.doe@protonmail.com",
    password: "123",
  },
};

/* Connect to the database. */
const connectionName: string =
  process.env.NODE_ENV === "test"
    ? "connection-to-db-for-testing"
    : "connection-to-db-for-dev";

const connectionPromise: Promise<Connection> = createConnection(connectionName);

/* Create a Koa application instance. */
const app: Koa = new Koa();

/* Configure the application instance to use a router middleware. */
const router: Router = new Router();

router.get("/api/users", (ctx: Koa.Context) => {
  const publicUsers: IPublicUsers = Object.keys(users).reduce(
    (obj: IPublicUsers, currIdStr: string) => {
      const { id, username, name, email, password } = users[currIdStr];
      obj[currIdStr] = { id, username };
      return obj;
    },
    {}
  );

  ctx.body = publicUsers;
});

router.post("/api/users", (ctx: Koa.Context) => {
  if (ctx.request.headers["content-type"] !== "application/json") {
    ctx.status = 400;
    ctx.body = {
      error: "Your request did not include a 'Content-Type: application/json' header",
    };
    return;
  }

  const expectedFields: string[] = ["username", "name", "email", "password"];
  for (let field of expectedFields) {
    if (!ctx.request.body.hasOwnProperty(field)) {
      ctx.status = 400;
      ctx.body = {
        error: `Your request body did not specify a '${field}'`,
      };
      return;
    }
  }

  const { username, name, email, password } = ctx.request.body;
  const ids: number[] = Object.keys(users).map((id) => users[id].id);
  const nextId: number = Math.max(...ids) + 1;
  const newUser: IUser = {
    id: nextId,
    username,
    name,
    email,
    password,
  };
  users[newUser.id.toString()] = newUser;

  ctx.status = 201;
  const newPublicUser: IPublicUser = {
    id: newUser.id,
    username: newUser.username,
  };
  ctx.body = newPublicUser;
});

app.use(bodyParser());

app.use(logger());

app.use(router.allowedMethods());

app.use(router.routes());

/* Create and return an HTTP server. */
if (process.env.NODE_ENV !== "test") {
  const serverPromise = connectionPromise
    .then((connection: Connection) => {
      console.log(
        `Establishing a connection (named "${connection.name}") to the DB - successful.`
      );

      const PORT: number = 3000;
      const server = app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}...`);
      });

      return server;
    })
    .catch((err) => console.error(err));
}

export { app, connectionPromise };
