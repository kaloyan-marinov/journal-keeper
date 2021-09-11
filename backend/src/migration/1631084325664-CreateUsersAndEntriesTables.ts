import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateUsersAndEntriesTables1631084325664 implements MigrationInterface {
    name = 'CreateUsersAndEntriesTables1631084325664'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `users` (`id` int NOT NULL AUTO_INCREMENT, `username` varchar(255) NOT NULL, `name` varchar(255) NOT NULL, `email` varchar(255) NOT NULL, `password_hash` varchar(255) NOT NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX `IDX_fe0bb3f6520ee0469504521e71` (`username`), UNIQUE INDEX `IDX_97672ac88f789774dd47f7c8be` (`email`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `entries` (`id` int NOT NULL AUTO_INCREMENT, `timestamp_in_utc` datetime NOT NULL, `utc_zone_of_timestamp` varchar(255) NOT NULL, `content` varchar(255) NOT NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP(6), `user_id` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `entries` ADD CONSTRAINT `FK_73b250bca5e5a24e1343da56168` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `entries` DROP FOREIGN KEY `FK_73b250bca5e5a24e1343da56168`");
        await queryRunner.query("DROP TABLE `entries`");
        await queryRunner.query("DROP INDEX `IDX_97672ac88f789774dd47f7c8be` ON `users`");
        await queryRunner.query("DROP INDEX `IDX_fe0bb3f6520ee0469504521e71` ON `users`");
        await queryRunner.query("DROP TABLE `users`");
    }

}
