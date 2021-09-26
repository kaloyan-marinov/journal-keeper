import {MigrationInterface, QueryRunner} from "typeorm";

export class ChangeTypeOfEntriesContentToText1632638318175 implements MigrationInterface {
    name = 'ChangeTypeOfEntriesContentToText1632638318175'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` CHANGE `created_at` `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP");
        await queryRunner.query("ALTER TABLE `users` CHANGE `updated_at` `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
        await queryRunner.query("ALTER TABLE `entries` DROP COLUMN `content`");
        await queryRunner.query("ALTER TABLE `entries` ADD `content` text NOT NULL");
        await queryRunner.query("ALTER TABLE `entries` CHANGE `created_at` `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP");
        await queryRunner.query("ALTER TABLE `entries` CHANGE `updated_at` `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `entries` CHANGE `updated_at` `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
        await queryRunner.query("ALTER TABLE `entries` CHANGE `created_at` `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP");
        await queryRunner.query("ALTER TABLE `entries` DROP COLUMN `content`");
        await queryRunner.query("ALTER TABLE `entries` ADD `content` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `users` CHANGE `updated_at` `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
        await queryRunner.query("ALTER TABLE `users` CHANGE `created_at` `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP");
    }

}
