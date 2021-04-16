import { config } from "dotenv";
import { User } from "./src/entities";
import { ConnectionOptions } from "typeorm";

config();
const { DATABASE_URL } = process.env;
console.log(
  `${new Date().toISOString()} -` +
    ` ${__filename}` +
    ` - inspecting the environment variable DATABASE_URL:`
);
console.log(DATABASE_URL);
if (DATABASE_URL === undefined) {
  console.log(
    `${new Date().toISOString()} -` +
      ` ${__filename} -` +
      ` no environment variable DATABASE_URL has been found - aborting!`
  );
  process.exit(1);
}

const connectionsOptionsObjects: ConnectionOptions[] = [
  {
    name: "connection-to-db-for-dev",
    type: "sqlite",
    database: DATABASE_URL,
    entities: [User],
    cli: {
      migrationsDir: "src/migration",
    },
    migrations: ["src/migration/*.ts"],
  },
  {
    name: "connection-to-db-for-testing",
    type: "sqlite",
    database: ":memory:",
    entities: [User],
  },
];

export default connectionsOptionsObjects;
