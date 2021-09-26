import {MigrationInterface, QueryRunner} from "typeorm";

export class ChangeTypeOfEntriesContentToText1632638318175 implements MigrationInterface {
    name = 'ChangeTypeOfEntriesContentToText1632638318175'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `entries` MODIFY `content` text NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `entries` MODIFY `content` varchar(255) NOT NULL");
    }

}
