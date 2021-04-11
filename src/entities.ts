import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

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
