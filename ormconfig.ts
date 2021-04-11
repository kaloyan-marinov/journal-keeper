import { config } from "dotenv";
import { User } from "./src/entities";

config();
const { DATABASE_URL } = process.env;
console.log(DATABASE_URL);
if (typeof DATABASE_URL !== "string") {
  process.exit(1);
}

/* TODO: try using the other syntax for exports */
module.exports = [
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
];
