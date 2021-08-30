import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import logger from "koa-logger";
import { Connection, createConnection, Repository, getConnection } from "typeorm";
import { User, Entry } from "./entities";
import { config } from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { PaginationHelper } from "./utilities";

/* Define "globals". */
interface IPublicUser {
  id: number;
  username: string;
}

const BCRYPT_SALT_ROUNDS: number = 10;

/* Extract environment-specific varialbes. */
config();
const SECRET_KEY: string | undefined = process.env.SECRET_KEY;
if (SECRET_KEY === undefined) {
  console.log(
    `${new Date().toISOString()} -` +
      ` ${__filename} -` +
      ` no environment variable SECRET_KEY has been found - aborting!`
  );
  process.exit(1);
}

const connectionName: string =
  process.env.NODE_ENV === "test"
    ? "connection-to-db-for-testing"
    : "connection-to-db-for-dev";

const connectionPromise: Promise<Connection> = createConnection(connectionName);

/* Create a Koa application instance. */
const app: Koa = new Koa();

/* Authentication middleware. */
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
  const usersRepository: Repository<User> =
    getConnection(connectionName).getRepository(User);
  const user: User | undefined = await usersRepository.findOne({ email });
  let isValidationSuccessful: boolean = false;
  if (user !== undefined) {
    isValidationSuccessful = await bcrypt.compare(password, user.passwordHash!);
  }

  // Depending on whether the validation was successful,
  // either terminate the current request-response cycle by issuing a 401 response,
  // or store the authenticated User
  // for the duration of the current request-response cycle.
  if (isValidationSuccessful === false) {
    ctx.status = 401;
    ctx.body = {
      error: "authentication required - incorrect email and/or password",
    };
    return;
  }

  ctx.user = user;
  await next();
};

const tokenAuth = async (ctx: Koa.Context, next: () => Promise<any>) => {
  // Look at the request's Authorization header.
  const authHeader = ctx.request.headers.authorization;
  if (authHeader === undefined) {
    ctx.status = 401;
    ctx.body = {
      error: "authentication required - via Bearer token",
    };
    return;
  }

  // Drop the word "Bearer"
  const token = authHeader.split(" ")[1];

  // Validate the JWS token.
  let jwtPayload: { userId: string };
  try {
    jwtPayload = jwt.verify(token, SECRET_KEY) as { userId: string };
    // TODO: perform a typecheck here?
  } catch (err) {
    ctx.status = 401;
    ctx.body = {
      error: "authentication required - invalid Bearer token",
    };
    return;
  }

  const usersRepository: Repository<User> =
    getConnection(connectionName).getRepository(User);
  const user: User | undefined = await usersRepository.findOne({
    id: parseInt(jwtPayload.userId),
  });
  if (user === undefined) {
    ctx.status = 401;
    ctx.body = {
      error: "authentication required - invalid Bearer token",
    };
    return;
  }

  // Store the authenticated User
  // for the duration of the current request-response cycle.
  ctx.user = user;
  await next();
};

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

  const usersRepository: Repository<User> =
    getConnection(connectionName).getRepository(User);
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
  user.passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
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
  const usersRepository: Repository<User> =
    getConnection(connectionName).getRepository(User);
  const userCount: number = await usersRepository.count();

  const paginationHelper = new PaginationHelper(
    ctx.query["perPage"] instanceof Array
      ? ctx.query["perPage"][0]
      : ctx.query["perPage"],
    ctx.query["page"] instanceof Array ? ctx.query["page"][0] : ctx.query["page"],
    userCount
  );

  const users: User[] = await usersRepository
    .createQueryBuilder("users") // But what is "users"? It's just a regular SQL alias.
    .limit(paginationHelper.perPage)
    .offset((paginationHelper.page - 1) * paginationHelper.perPage)
    .getMany();

  const publicUsers: IPublicUser[] = users.map((u) => ({
    id: u.id!,
    username: u.username!,
  }));

  const _links = paginationHelper.buildLinks(ctx.request.origin, ctx.request.path);

  ctx.body = {
    _meta: {
      totalItems: userCount,
      perPage: paginationHelper.perPage,
      totalPages: paginationHelper.totalPages,
      page: paginationHelper.page,
    },
    _links,
    items: publicUsers,
  };
});

router.get("/api/users/:id", async (ctx: Koa.Context) => {
  const userId: number = parseInt(ctx.params.id);
  const usersRepository: Repository<User> =
    getConnection(connectionName).getRepository(User);
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

router.put("/api/users/:id", basicAuth, async (ctx: Koa.Context) => {
  const userId: number = parseInt(ctx.params.id);
  if (userId !== ctx.user.id) {
    ctx.status = 403;
    ctx.body = {
      error: "You are not allowed to edit any User resource different from your own",
    };
    return;
  }

  if (ctx.request.headers["content-type"] !== "application/json") {
    ctx.status = 400;
    ctx.body = {
      error: "Your request did not include a 'Content-Type: application/json' header",
    };
    return;
  }

  // Edit the User resource,
  // which corresponds to the user authenticated by the request's header,
  // with the information within the request's body.
  const { username, name, email, password } = ctx.request.body;

  const usersRepository: Repository<User> =
    getConnection(connectionName).getRepository(User);
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

    ctx.user.username = newUsername;
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

    ctx.user.email = newEmail;
  }

  if (name !== undefined) {
    const newName: string = name.trim();

    ctx.user.name = newName;
  }

  if (password !== undefined) {
    ctx.user.passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  }

  // Save the edited User resource, and return its public representation.
  await usersRepository.save(ctx.user);

  ctx.body = {
    id: ctx.user.id,
    username: ctx.user.username,
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

  const usersRepository: Repository<User> =
    getConnection(connectionName).getRepository(User);
  await usersRepository.delete({ id: userId });

  ctx.status = 204;
});

router.post("/api/tokens", basicAuth, async (ctx: Koa.Context) => {
  console.log(`${new Date().toISOString()} - issuing a JWS token`);
  const payload = { userId: ctx.user.id };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1m" });
  ctx.body = { token };
});

router.get("/api/user-profile", tokenAuth, async (ctx: Koa.Context) => {
  const usersRepository: Repository<User> =
    getConnection(connectionName).getRepository(User);
  const user: User | undefined = await usersRepository.findOne({
    select: ["id", "username", "name", "email", "createdAt", "updatedAt"],
    where: {
      id: ctx.user.id,
    },
  });
  ctx.body = user;
});

router.post("/api/entries", tokenAuth, async (ctx: Koa.Context) => {
  if (ctx.request.headers["content-type"] !== "application/json") {
    ctx.status = 400;
    ctx.body = {
      error: "Your request did not include a 'Content-Type: application/json' header",
    };
    return;
  }

  const expectedFields: string[] = ["timezone", "localTime", "content"];
  for (let field of expectedFields) {
    if (!ctx.request.body.hasOwnProperty(field)) {
      ctx.status = 400;
      ctx.body = {
        error: `Your request body did not specify a '${field}'`,
      };
      return;
    }
  }
  const { timezone, localTime, content } = ctx.request.body;

  const entry: Entry = new Entry();
  entry.utcZoneOfTimestamp = timezone;
  entry.timestampInUTC = localTime + timezone;
  entry.content = content;
  entry.userId = ctx.user.id;
  const entriesRepository: Repository<Entry> =
    getConnection(connectionName).getRepository(Entry);
  await entriesRepository.save(entry);

  ctx.status = 201;
  ctx.set("Location", `/api/entries/${entry.id}`);
  ctx.body = await entriesRepository.findOne({ id: entry.id });
});

router.get("/api/entries", tokenAuth, async (ctx: Koa.Context) => {
  const entriesRepository: Repository<Entry> =
    getConnection(connectionName).getRepository(Entry);
  const entries: Entry[] = await entriesRepository.find({ userId: ctx.user.id });
  ctx.body = { entries };
});

router.get("/api/entries/:id", tokenAuth, async (ctx: Koa.Context) => {
  const entryId: number = parseInt(ctx.params.id);
  const entriesRepository: Repository<Entry> =
    getConnection(connectionName).getRepository(Entry);
  const entry: Entry | undefined = await entriesRepository.findOne({ id: entryId });

  if (entry === undefined || entry.userId !== ctx.user.id) {
    ctx.status = 404;
    ctx.body = {
      error: `Your User doesn't have an Entry resource with an ID of ${entryId}`,
    };
    return;
  }

  ctx.body = entry;
});

router.put("/api/entries/:id", tokenAuth, async (ctx: Koa.Context) => {
  const entryId: number = parseInt(ctx.params.id);
  const entriesRepository: Repository<Entry> =
    getConnection(connectionName).getRepository(Entry);
  const entry: Entry | undefined = await entriesRepository.findOne({ id: entryId });

  if (entry === undefined || entry.userId !== ctx.user.id) {
    ctx.status = 404;
    ctx.body = {
      error: `Your User doesn't have an Entry resource with an ID of ${entryId}`,
    };
    return;
  }

  // Edit the Entry resource with the information within the request's body.
  const { timezone, localTime, content } = ctx.request.body;

  if (
    (timezone !== undefined && localTime === undefined) ||
    (timezone === undefined && localTime !== undefined)
  ) {
    ctx.status = 400;
    ctx.body = {
      error:
        "Your request body must include" +
        " either both of 'timezone' and 'localTime', or neither one of them",
    };
    return;
  } else if (timezone !== undefined && localTime !== undefined) {
    entry.utcZoneOfTimestamp = timezone;
    entry.timestampInUTC = localTime + timezone;
  }

  if (content !== undefined) {
    entry.content = content;
  }

  // Save the edited Entry resource, and return its representation.
  await entriesRepository.save(entry);

  ctx.body = await entriesRepository.findOne({ id: entryId });
});

router.delete("/api/entries/:id", tokenAuth, async (ctx: Koa.Context) => {
  const entryId: number = parseInt(ctx.params.id);
  const entriesRepository: Repository<Entry> =
    getConnection(connectionName).getRepository(Entry);
  const entry: Entry | undefined = await entriesRepository.findOne({ id: entryId });

  if (entry === undefined || entry.userId !== ctx.user.id) {
    ctx.status = 404;
    ctx.body = {
      error: `Your User doesn't have an Entry resource with an ID of ${entryId}`,
    };
    return;
  }

  await entriesRepository.delete({ id: entryId });
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

      const PORT: number = 5000;
      const server = app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}...`);
      });

      return server;
    })
    .catch((err) => console.error(err));
}

export { app, connectionPromise };
