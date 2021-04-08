import Koa from "koa";
import Router from "koa-router";

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

app.use(router.allowedMethods());

app.use(router.routes());

/* Create and start an HTTP server. */
app.listen(3000, () => {
  console.log(`Server listening on port 3000`);
});
