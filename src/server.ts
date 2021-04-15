import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import logger from "koa-logger";
import { Connection, createConnection, Repository, getConnection } from "typeorm";
import { User } from "./entities";

/* Introduce an in-memory database. */
interface IPublicUser {
  id: number;
  username: string;
}

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

router.post("/api/users", async (ctx: Koa.Context) => {
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

  const usersRepository: Repository<User> = getConnection(connectionName).getRepository(
    User
  );
  let duplicateUser: User | undefined;
  duplicateUser = await usersRepository.findOne({ username });
  if (duplicateUser !== undefined) {
    ctx.status = 400;
    ctx.body = {
      error: "There already exists a User resource with the username that you provided",
    };
    return;
  }
  duplicateUser = await usersRepository.findOne({ email });
  if (duplicateUser !== undefined) {
    ctx.status = 400;
    ctx.body = {
      error: "There already exists a User resource with the email that you provided",
    };
    return;
  }

  let user: User = new User();
  user.username = username.trim();
  user.name = name.trim();
  user.email = email.trim();
  user.password = password;
  await usersRepository.save(user);

  ctx.status = 201;
  ctx.set("Location", `/api/users/${user.id}`);
  const newPublicUser: IPublicUser = {
    id: user.id!,
    username: user.username!,
  };
  ctx.body = newPublicUser;
});

router.get("/api/users", async (ctx: Koa.Context) => {
  const usersRepository: Repository<User> = getConnection(connectionName).getRepository(
    User
  );
  const users: User[] = await usersRepository.find();

  const publicUsers: IPublicUser[] = users.map((u) => ({
    id: u.id!,
    username: u.username!,
  }));

  ctx.body = { users: publicUsers };
});

router.get("/api/users/:id", async (ctx: Koa.Context) => {
  const userId: number = ctx.params.id;
  const usersRepository: Repository<User> = getConnection(connectionName).getRepository(
    User
  );
  const user: User | undefined = await usersRepository.findOne({ id: userId });

  if (user === undefined) {
    ctx.status = 404;
    ctx.body = {
      error: `There doesn't exist a User resource with an ID of ${userId}`,
    };
    return;
  }

  ctx.body = {
    id: user.id,
    username: user.username,
  };
});

const basicAuth = async (ctx: Koa.Context, next: () => Promise<any>) => {
  // Look at the request's Authorization header.
  const authHeader = ctx.request.headers.authorization;
  if (authHeader === undefined) {
    ctx.status = 401;
    ctx.body = {
      error: "authentication required - via Basic authentication",
    };
    return;
  }
  // Drop the word "Basic"
  const authCredsEncoded = authHeader.split(" ")[1];
  // Extract the authentication credentials.
  const authCredsDecoded = Buffer.from(authCredsEncoded, "base64").toString();
  const [email, password] = authCredsDecoded.split(":");

  // Validate the authentication credentials.
  const usersRepository: Repository<User> = getConnection(connectionName).getRepository(
    User
  );
  const user: User | undefined = await usersRepository.findOne({ email });
  if (user === undefined || password !== user.password) {
    ctx.status = 401;
    ctx.body = {
      error: "authentication required - incorrect email and/or password",
    };
    return;
  }

  // Store the authenticated User
  // for the duration of the current request-response cycle.
  ctx.user = user;
  await next();
};

router.put("/api/users/:id", async (ctx: Koa.Context) => {
  if (ctx.request.headers["content-type"] !== "application/json") {
    ctx.status = 400;
    ctx.body = {
      error: "Your request did not include a 'Content-Type: application/json' header",
    };
    return;
  }

  const userId: number = ctx.params.id;
  const usersRepository: Repository<User> = getConnection(connectionName).getRepository(
    User
  );
  const user: User | undefined = await usersRepository.findOne({ id: userId });

  if (user === undefined) {
    ctx.status = 404;
    ctx.body = {
      error: `There doesn't exist a User resource with an ID of ${userId}`,
    };
    return;
  }

  const { username, name, email, password } = ctx.request.body;

  let duplicateUser: User | undefined;

  if (username !== undefined) {
    const newUsername: string = username.trim();

    duplicateUser = await usersRepository.findOne({ username: newUsername });
    if (duplicateUser !== undefined) {
      ctx.status = 400;
      ctx.body = {
        error: `There already exists a User resource with a username of '${newUsername}'`,
      };
      return;
    }

    user.username = newUsername;
  }

  if (email !== undefined) {
    const newEmail: string = email.trim();

    duplicateUser = await usersRepository.findOne({ email: newEmail });
    if (duplicateUser !== undefined) {
      ctx.status = 400;
      ctx.body = {
        error: `There already exists a User resource with an email of '${newEmail}'`,
      };
      return;
    }

    user.email = newEmail;
  }

  if (name !== undefined) {
    const newName: string = name.trim();

    user.name = newName;
  }

  if (password !== undefined) {
    user.password = password;
  }

  await usersRepository.save(user);

  ctx.body = {
    id: user.id,
    username: user.username,
  };
});

router.delete("/api/users/:id", basicAuth, async (ctx: Koa.Context) => {
  const userId = parseInt(ctx.params.id);
  if (userId !== ctx.user.id) {
    ctx.status = 403;
    ctx.body = {
      error: "You are not allowed to delete any User resource different from your own",
    };
    return;
  }

  const usersRepository: Repository<User> = getConnection(connectionName).getRepository(
    User
  );
  await usersRepository.delete({ id: userId });

  ctx.status = 204;
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
