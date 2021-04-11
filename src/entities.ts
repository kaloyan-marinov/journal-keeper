import { config } from "dotenv";
import Koa from "koa";
import {
  createConnection,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

config();
const { DATABASE_URL } = process.env;
console.log(DATABASE_URL);
if (typeof DATABASE_URL !== "string") {
  process.exit(1);
}

export const connectToDB = async (app: Koa): Promise<void> => {
  const connection = await createConnection({
    type: "sqlite",
    database: DATABASE_URL,
    entities: [User],
  });

  await connection
    .synchronize(true)
    .then(() => console.log("synchronized with DB"))
    .catch(() => console.error("failed to sync with the DB"));

  app.context.db = connection;
};

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({
    unique: true,
    nullable: false,
    length: 255,
  })
  username?: string;

  @Column({
    nullable: false,
    length: 255,
  })
  name?: string;

  @Column({
    unique: true,
    nullable: false,
    length: 255,
  })
  email?: string;

  @Column({
    nullable: false,
    length: 255,
  })
  password?: string;

  @CreateDateColumn({
    default: () => "CURRENT_TIMESTAMP",
    type: "datetime",
    name: "created_at",
  })
  createdAt?: Date;

  @UpdateDateColumn({
    default: () => "CURRENT_TIMESTAMP",
    type: "datetime",
    name: "updated_at",
  })
  updatedAt?: Date;
}
