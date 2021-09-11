import { config } from "dotenv";
import { ConnectionOptions } from "typeorm";
import path from "path";

config();

// const { DATABASE_URL } = process.env;
// console.log(
//   `${new Date().toISOString()} -` +
//     ` ${__filename}` +
//     ` - inspecting the environment variable DATABASE_URL:`
// );
// console.log(DATABASE_URL);
// if (DATABASE_URL === undefined) {
//   console.log(
//     `${new Date().toISOString()} -` +
//       ` ${__filename} -` +
//       ` no environment variable DATABASE_URL has been found - aborting!`
//   );
//   process.exit(1);
// }

let sourceCodeFolder: string = process.env.NODE_ENV === "production" ? "dist" : "src";
console.log(
  `${new Date().toISOString()} -` +
    ` ${__filename} -` +
    ` inspecting the value of sourceCodeFolder:`
);
console.log(sourceCodeFolder);

const connectionsOptionsObjects: ConnectionOptions[] = [
  {
    name: "connection-to-db-for-dev",
    type: process.env.DATABASE_TYPE as "mysql",
    host: process.env.DATABASE_HOSTNAME,
    port: parseInt(process.env.DATABASE_PORT as string),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: [path.join(sourceCodeFolder, "entities.*")],
    cli: {
      migrationsDir: path.join(sourceCodeFolder, "migration"),
    },
    migrations: [path.join(sourceCodeFolder, "migration", "*.ts")],
  },
  {
    name: "connection-to-db-for-testing",
    type: "sqlite",
    database: ":memory:",
    entities: [path.join(sourceCodeFolder, "entities.*")],
  },
];

export default connectionsOptionsObjects;
