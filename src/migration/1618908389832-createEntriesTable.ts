import {MigrationInterface, QueryRunner} from "typeorm";

export class createEntriesTable1618908389832 implements MigrationInterface {
    name = 'createEntriesTable1618908389832'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "entries" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "timestamp_in_utc" datetime NOT NULL, "utc_zone_of_timestamp" varchar NOT NULL, "content" varchar NOT NULL, "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "user_id" integer NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "temporary_entries" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "timestamp_in_utc" datetime NOT NULL, "utc_zone_of_timestamp" varchar NOT NULL, "content" varchar NOT NULL, "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "user_id" integer NOT NULL, CONSTRAINT "FK_73b250bca5e5a24e1343da56168" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_entries"("id", "timestamp_in_utc", "utc_zone_of_timestamp", "content", "created_at", "updated_at", "user_id") SELECT "id", "timestamp_in_utc", "utc_zone_of_timestamp", "content", "created_at", "updated_at", "user_id" FROM "entries"`);
        await queryRunner.query(`DROP TABLE "entries"`);
        await queryRunner.query(`ALTER TABLE "temporary_entries" RENAME TO "entries"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "entries" RENAME TO "temporary_entries"`);
        await queryRunner.query(`CREATE TABLE "entries" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "timestamp_in_utc" datetime NOT NULL, "utc_zone_of_timestamp" varchar NOT NULL, "content" varchar NOT NULL, "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "user_id" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "entries"("id", "timestamp_in_utc", "utc_zone_of_timestamp", "content", "created_at", "updated_at", "user_id") SELECT "id", "timestamp_in_utc", "utc_zone_of_timestamp", "content", "created_at", "updated_at", "user_id" FROM "temporary_entries"`);
        await queryRunner.query(`DROP TABLE "temporary_entries"`);
        await queryRunner.query(`DROP TABLE "entries"`);
    }

}
