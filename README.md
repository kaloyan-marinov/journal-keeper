# Table of contents

This repository's documentation is organized as follows.

1. [Introduction](#introduction)

2. [The functionality provided by the web application](#the-functionality-provided-by-the-web-application)

3. [How to set up the project for local development](#how-to-set-up-the-project-for-local-development)

4. [How to use Vanilla Docker to run a containerized version of the project](#how-to-use-vanilla-docker-to-run-a-containerized-version-of-the-project)

5. [How to use Docker Compose to run a containerized version of the project](#how-to-use-docker-compose-to-run-a-containerized-version-of-the-project)

6. [Future plans](#future-plans)

# Introduction

`JournalKeeper` is a web application that allows the user to keep a personal journal online.

I decided to build such an application, because (a) sometimes I will journal about past or present expriences; (b) occasionally I will write down a particularly vivid dream; and (c) I regularly take notes about things that strike me as important or interesting.

As of September 2021, my journaling has used up several notebooks. My plan is for this web application to provide a centralized place for my future journal entries.

# The functionality provided by the web application

In a nutshell, `JournalKeeper` allows the user to keep a personal journal online.

The first step is for you to create a `JournalKeeper` account, which will store and protect your data.

Next, you can log into your account and create your own journal entries therein.

# How to set up the project for local development

<ul>

   <li>
   Stage 1: clone this repository, and navigate into your local repository
   </li>

   <li>
   Stage 2: inside the `backend` subfolder of your local repository, create a `.env` file with the following structure:

   ```
   SECRET_KEY=<specify-a-good-secret-key-here>

   DATABASE_TYPE=mysql
   DATABASE_HOSTNAME=localhost
   DATABASE_PORT=3306
   DATABASE_USERNAME=<journal-keeper-username>
   DATABASE_PASSWORD=<journal-keeper-password>
   DATABASE_NAME=<journal-keeper-database>
   ```

   (For deployment, you should generate a "good secret key" and store that value in `SECRET_KEY` within the `.env` file; to achieve that, take a look at the "How to generate good secret keys" section on https://flask.palletsprojects.com/en/1.1.x/quickstart/ . For local development, something like `keep-this-value-known-only-to-the-deployment-machine` should suffice.)
   </li>

   <li>
   Stage 3: create a host running MySQL Server, along with a database and a (database-)user that is granted privileges for working with that database

   OPTION A (relies [on understanding the basics of and] using Docker

   - inside the `backend` subfolder of your local repository, create a `.env.lone-db-container` file with the following structure:
      ```
      MYSQL_RANDOM_ROOT_PASSWORD=yes
      MYSQL_USER=<provide-the-same-value-as-for-DATABASE_USERNAME-in-`backend/.env`>
      MYSQL_PASSWORD=<provide-the-same-value-as-for-DATABASE_PASSWORD-in-`backend/.env`>
      MYSQL_DATABASE=<provide-the-same-value-as-for-DATABASE_NAME-in-`backend/.env`>
      ```

   - create a host running MySQL Server, along with a database and a (database-)user, by issuing:

      ```
      docker run \
         --name container-journal-keeper-mysql \
         --add-host host.docker.internal:host-gateway \
         --mount source=volume-journal-keeper-mysql,destination=/var/lib/mysql \
         --env-file backend/.env.lone-db-container \
         --publish 3306:3306 \
         mysql:8.0.26 \
         --default-authentication-plugin=mysql_native_password
      ```
   
   - connect to the `container-journal-keeper-mysql` in interactive mode, and then log in to the MySQL Server as the created user in order to verify that (1) the new user is able to `USE` the new database as well as (2) that the new database does not contain any tables:
   
      ```
      $ docker container exec \
         -it \
         container-journal-keeper-mysql \
         /bin/bash
      
      root@<id-of-the-container>:/# mysql -u <journal-keeper-username> -p
      Enter password:
      Welcome to the MySQL monitor.  Commands end with ; or \g.
      ...

      mysql> USE <journal-keeper-database>;
      Database changed
      mysql> SHOW TABLES;
      Empty set (0.00 sec)

      mysql> quit;
      Bye
      root@<id-of-the-container>:/# exit
      exit

      ```

   OPTION B (relies on installing MySQL server on your system, and working with that installation directly)

   - download MySQL Server, install it on your system, and secure the installation (all of which can be accomplished by following the instructions given in [this article](https://linuxize.com/post/how-to-install-mysql-on-ubuntu-18-04/))

   - log in to MySQL Server as the root user in order to: create a new database; create a new user and set an associated password; and grant the new user all privileges on the new database:
      ```
      $ sudo mysql
      [sudo] password for <your-OS-user>

      mysql> SHOW DATABASES;
      +--------------------+
      | Database           |
      +--------------------+
      | information_schema |
      | mysql              |
      | performance_schema |
      | sys                |
      +--------------------+
      4 rows in set (0.01 sec)

      mysql> CREATE DATABASE IF NOT EXISTS `<journal-keeper-database>`;
      Query OK, 1 row affected (0.04 sec)

      mysql> SHOW DATABASES;
      +-----------------------+
      | Database              |
      +-----------------------+
      | <journal-keeper-database> |
      | information_schema    |
      | mysql                 |
      | performance_schema    |
      | sys                   |
      +-----------------------+
      5 rows in set (0.01 sec)
      ```

      ```
      mysql> CREATE USER IF NOT EXISTS `<journal-keeper-username>`@`localhost` IDENTIFIED BY '<journal-keeper-password>';
      Query OK, 0 rows affected (0.03 sec)

      mysql> SELECT user, host, plugin FROM mysql.user;
      +-----------------------+-----------+-----------------------+
      | user                  | host      | plugin                |
      +-----------------------+-----------+-----------------------+
      | debian-sys-maint      | localhost | <omitted>             |
      | <journal-keeper-username> | localhost | caching_sha2_password |
      | mysql.infoschema      | localhost | <omitted>             |
      | mysql.session         | localhost | <omitted>             |
      | mysql.sys             | localhost | <omitted>             |
      | root                  | localhost | auth_socket           |
      +-----------------------+-----------+-----------------------+
      6 rows in set (0.00 sec)
      ```

      ```
      mysql> SHOW GRANTS FOR `<journal-keeper-username>`@`localhost`;
      +-----------------------------------------------------------+
      | Grants for <journal-keeper-username>@localhost                |
      +-----------------------------------------------------------+
      | GRANT USAGE ON *.* TO `<journal-keeper-username>`@`localhost` |
      +-----------------------------------------------------------+
      1 row in set (0.00 sec)

      mysql> GRANT ALL PRIVILEGES ON `<journal-keeper-database>`.* TO `<journal-keeper-username>`@`localhost`;
      Query OK, 0 rows affected (0.01 sec)

      mysql> SHOW GRANTS FOR `<journal-keeper-username>`@`localhost`;
      +------------------------------------------------------------------------------------------+
      | Grants for <journal-keeper-username>@localhost                                               |
      +------------------------------------------------------------------------------------------+
      | GRANT USAGE ON *.* TO `<journal-keeper-username>`@`localhost`                                |
      | GRANT ALL PRIVILEGES ON `<journal-keeper-database>`.* TO `<journal-keeper-username>`@`localhost` |
      +------------------------------------------------------------------------------------------+
      2 rows in set (0.00 sec)

      mysql> FLUSH PRIVILEGES;
      Query OK, 0 rows affected (0.01 sec)

      mysql> SHOW GRANTS FOR `<journal-keeper-username>`@`localhost`;
      +------------------------------------------------------------------------------------------+
      | Grants for <journal-keeper-username>@localhost                                               |
      +------------------------------------------------------------------------------------------+
      | GRANT USAGE ON *.* TO `<journal-keeper-username>`@`localhost`                                |
      | GRANT ALL PRIVILEGES ON `<journal-keeper-database>`.* TO `<journal-keeper-username>`@`localhost` |
      +------------------------------------------------------------------------------------------+
      2 rows in set (0.00 sec)

      mysql> quit;
      Bye
      $
      ```

   - log in to the MySQL Server as the created user in order to verify that (1) the new user is able to `USE` the new database as well as (2) that the new database does not contain any tables:
      ```
      $ mysql -u <journal-keeper-username> -p
      Enter password:
      Welcome to the MySQL monitor.  Commands end with ; or \g.
      Your MySQL connection id is 11
      Server version: 8.0.23-0ubuntu0.20.04.1 (Ubuntu)

      Copyright (c) 2000, 2021, Oracle and/or its affiliates.

      Oracle is a registered trademark of Oracle Corporation and/or its
      affiliates. Other names may be trademarks of their respective
      owners.

      Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

      mysql> SHOW DATABASES;
      +-----------------------+
      | Database              |
      +-----------------------+
      | <journal-keeper-database> |
      | information_schema    |
      +-----------------------+
      2 rows in set (0.00 sec)

      mysql> USE <journal-keeper-database>;
      Database changed
      mysql> SHOW TABLES;
      Empty set (0.00 sec)

      mysql> quit;
      Bye
      ```
   </li>

   <li>
   Stage 4: set up the backend

   - install the Node.js dependencies:
      ```
      # But first, make sure that you have downloaded the Node.js runtime
      # and installed it on your system.

      # The version used to develop this project is specified below:

      $ node --version
      v14.15.0
      $ npm --version
      6.14.8
      ```

      ```
      backend $ npm install
      ```

   - ensure that running the tests results in a PASS by issuing any one of the following:
      ```
      backend $ ./node_modules/.bin/jest
      ```

      ```
      backend $ npm run test
      ```

      ```
      backend $ npm test
      ```

      which will create a `coverage` subfolder with a report of test coverage; to view that report, open `coverage/index.html` in your web browser

      (to run the tests in watch mode, issue any one of the following: `backend $ ./node_modules/.bin/jest --watchAll` or `backend $ npm run test--watchAll`; each re-run of which will update the contents of the `coverage` subfolder)

   - apply all database migrations to the database, which was created a few steps ago (and is still empty):
      ```
      # Issue either:
      backend $ ./node_modules/.bin/ts-node \
         ./node_modules/typeorm/cli.js \
         migration:run \
         -c connection-to-db-for-dev
      
      # or
      backend $ npm run migration:run -- \
         -c connection-to-db-for-dev
      ```

   - verify that the previous step was successful - if you performed Stage 3 by following its OPTION B, you can verify that the previous step was successful by issuing `$ mysql -u <journal-keeper-username> -p` and then issuing:
      ```
      mysql> SHOW DATABASES;
      +-------------------------+
      | Database                |
      +-------------------------+
      | information_schema      |
      | journal-keeper-database |
      +-------------------------+
      2 rows in set (0.00 sec)

      mysql> USE <journal-keeper-database>;
      Database changed

      mysql> SHOW TABLES;
      +-----------------------------------+
      | Tables_in_journal-keeper-database |
      +-----------------------------------+
      | entries                           |
      | migrations                        |
      | users                             |
      +-----------------------------------+
      3 rows in set (0.00 sec)

      mysql> SHOW CREATE TABLE users;
      +-------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
      | Table | Create Table                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
      +-------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
      | users | CREATE TABLE `users` (
         `id` int NOT NULL AUTO_INCREMENT,
         `username` varchar(255) NOT NULL,
         `name` varchar(255) NOT NULL,
         `email` varchar(255) NOT NULL,
         `password_hash` varchar(255) NOT NULL,
         `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
         `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
         PRIMARY KEY (`id`),
         UNIQUE KEY `IDX_fe0bb3f6520ee0469504521e71` (`username`),
         UNIQUE KEY `IDX_97672ac88f789774dd47f7c8be` (`email`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci |
      +-------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
      1 row in set (0.01 sec)

      mysql> SHOW CREATE TABLE entries;
      +---------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
      | Table   | Create Table                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
      +---------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
      | entries | CREATE TABLE `entries` (
         `id` int NOT NULL AUTO_INCREMENT,
         `timestamp_in_utc` datetime NOT NULL,
         `utc_zone_of_timestamp` varchar(255) NOT NULL,
         `content` varchar(255) NOT NULL,
         `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
         `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
         `user_id` int NOT NULL,
         PRIMARY KEY (`id`),
         KEY `FK_73b250bca5e5a24e1343da56168` (`user_id`),
         CONSTRAINT `FK_73b250bca5e5a24e1343da56168` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci |
      +---------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
      1 row in set (0.00 sec)

      mysql> SELECT * FROM users;
      Empty set (0.00 sec)

      mysql> SELECT * FROM entries;
      Empty set (0.00 sec)
      ```
   </li>

   <li>
   Step 5: set up the frontend

   - install the Node.js dependencies:
      ```
      frontend $ npm install
      ```

   - ensure that running the tests results in a PASS by issuing the following:
      ```
      frontend $ npm test -- \
         --coverage
      ```

      which will create a `coverage` subfolder with a report of test coverage; to view that report, open `coverage/lcov-report/index.html` in your web browser

      (to run the tests in watch mode, issue any one of the following: `frontend $ npm test -- --coverage --watchAll`; each re-run of which will update the contents of the `coverage` subfolder)
   </li>

   <li>
   Step 6: start serving the backend application and the frontend application

   - launch a terminal instance and, in it, start a process responsible for serving the backend application instance; the ways of starting such a process can be broken down into the following categories:

      (a) without re-starting the project when changes are made
      
        - (approach a.1): directly run the whole project by issuing `backend $ ./node_modules/.bin/ts-node src/server.ts` or `backend $ npm run serve`

        - (approach a.2): first, compile the whole project by issuing
            ```
            backend $ ./node_modules/.bin/tsc
            ```
            which is going to create a `dist` subfolder containing JavaScript files (as the result of the transpilation process); second, add the following to the `backend/.env` file:
            ```
            TYPEORM_CONNECTION=mysql
            TYPEORM_HOST=192.168.1.170
            TYPEORM_PORT=3306
            TYPEORM_USERNAME=journal-keeper-username-local
            TYPEORM_PASSWORD=journal-keeper-password-local
            TYPEORM_DATABASE=journal-keeper-database
            TYPEORM_ENTITIES=dist/entities.js
            ```
            and third, run the transpiled project by issuing 
            ```
            backend $ NODE_ENV=prod node dist/server.js
            ```
            THIS IS IMPORTANT: BEFORE PROCEEDING, REVERT THE `backend/.env` FILE TO ITS PREVIOUS STATE (if you don't revert it, then running the backend tests will result in a failure, with the reason for the failure being that the running of the backend tests will cause the Node.js runtime to take the database-connection information required by TypeORM from the added `TYPEORM_*` environment variables instead of from `backend/ormconfig.ts`).

      (b) in such a way that the project is re-started whenever changes are made

        - (approach b.1): directly run the compiled project by issuing `backend $ ./node_modules/.bin/nodemon` or `backend $ npm run dev`; _this approach ensures that the project will be re-started whenever changes are made to the `src/server.ts` file_

      ---

      at this point, it is a good idea to verify that the backend is up and running - launch another terminal instance and, in it, issue:
      ```
      export PORT=5000
      ```

      ```
      $ curl \
         -v \
         -X POST \
         -H "Content-Type: application/json" \
         -d '{"username": "jd", "name": "John Doe", "email": "john.doe@protonmail.com", "password": "123"}' \
         localhost:${PORT}/api/users \
         | json_pp

      ...
      < HTTP/1.1 201 Created
      < Location: /api/users/1
      < Content-Type: application/json; charset=utf-8
      < Content-Length: 24
      < Date: Sun, 18 Apr 2021 07:36:32 GMT
      < Connection: keep-alive
      < Keep-Alive: timeout=5
      < 
      ...
      {
         "id" : 1,
         "username" : "jd"
      }
      ```

      ```
      $ curl \
         -v \
         localhost:${PORT}/api/users \
         | json_pp

      ...
      < HTTP/1.1 200 OK
      < Content-Type: application/json; charset=utf-8
      < Content-Length: 248
      < Date: Sun, 05 Sep 2021 07:36:45 GMT
      < Connection: keep-alive
      < Keep-Alive: timeout=5
      < 
      { [248 bytes data]
      100   248  100   248    0     0   9920      0 --:--:-- --:--:-- --:--:--  9920
      * Connection #0 to host localhost left intact
      * Closing connection 0
      {
         "_links" : {
            "first" : "/api/users?perPage=10&page=1",
            "last" : "/api/users?perPage=10&page=1",
            "next" : null,
            "prev" : null,
            "self" : "/api/users?perPage=10&page=1"
         },
         "_meta" : {
            "page" : 1,
            "perPage" : 10,
            "totalItems" : 1,
            "totalPages" : 1
         },
         "items" : [
            {
               "id" : 1,
               "username" : "jd"
            }
         ]
      }
      ```

      ```
      $ curl \
         -v \
         -X POST \
         -H "Content-Type: application/json" \
         -d '{"username": "ms", "name": "Mary Smith", "email": "mary.smith@protonmail.com", "password": "456"}' \
         localhost:${PORT}/api/users \
         | json_pp

      ...
      < HTTP/1.1 201 Created
      < Location: /api/users/2
      < Content-Type: application/json; charset=utf-8
      < Content-Length: 24
      < Date: Sun, 18 Apr 2021 07:41:16 GMT
      < Connection: keep-alive
      < Keep-Alive: timeout=5
      <
      ...
      {
         "username" : "ms",
         "id" : 2
      }
      ```

      ```
      $ curl \
         -v \
         localhost:${PORT}/api/users \
         | json_pp
      
      ...
      < HTTP/1.1 200 OK
      < Content-Type: application/json; charset=utf-8
      < Content-Length: 273
      < Date: Sun, 05 Sep 2021 07:37:28 GMT
      < Connection: keep-alive
      < Keep-Alive: timeout=5
      < 
      { [273 bytes data]
      100   273  100   273    0     0  13650      0 --:--:-- --:--:-- --:--:-- 13650
      * Connection #0 to host localhost left intact
      * Closing connection 0
      {
         "_links" : {
            "first" : "/api/users?perPage=10&page=1",
            "last" : "/api/users?perPage=10&page=1",
            "next" : null,
            "prev" : null,
            "self" : "/api/users?perPage=10&page=1"
         },
         "_meta" : {
            "page" : 1,
            "perPage" : 10,
            "totalItems" : 2,
            "totalPages" : 1
         },
         "items" : [
            {
               "id" : 1,
               "username" : "jd"
            },
            {
               "id" : 2,
               "username" : "ms"
            }
         ]
      }
      ```

      ```
      $ curl \
         -v \
         -X POST \
         -u john.doe@protonmail.com:123 \
         localhost:${PORT}/api/tokens \
         | json_pp

      $ export T1=<the-value-of-the-returned JWS-token>
      ```

      ```
      $ curl \
         -v \
         -X POST \
         -u mary.smith@protonmail.com:456 \
         localhost:${PORT}/api/tokens \
         | json_pp

      $ export T2=<the-value-of-the-returned JWS-token>
      ```

      ```
      $ curl \
         -v \
         -X POST \
         -H "Authorization: Bearer ${T1}" \
         -H "Content-Type: application/json" \
         -d '{"timezone": "+02:00", "localTime": "2020-12-01 17:17", "content": "Then it dawned on me: there is no finish line!"}' \
         localhost:${PORT}/api/entries \
         | json_pp
      ```

      ```
      $ curl \
         -v \
         -X POST \
         -H "Authorization: Bearer ${T2}" \
         -H "Content-Type: application/json" \
         -d '{"timezone": "+01:00", "localTime": "2019-08-20 14:17", "content": "Mallorca has beautiful sunny beaches!"}' \
         localhost:${PORT}/api/entries \
         | json_pp
      ```

      ```
      $ curl \
         -v \
         -H "Authorization: Bearer ${T1}" \
         localhost:${PORT}/api/entries \
         | json_pp
      
      ...
      < HTTP/1.1 200 OK
      < Content-Type: application/json; charset=utf-8
      < Content-Length: 460
      < Date: Sun, 05 Sep 2021 07:38:56 GMT
      < Connection: keep-alive
      < Keep-Alive: timeout=5
      < 
      { [460 bytes data]
      100   460  100   460    0     0  10952      0 --:--:-- --:--:-- --:--:-- 10952
      * Connection #0 to host localhost left intact
      * Closing connection 0
      {
         "_links" : {
            "first" : "/api/entries?perPage=10&page=1",
            "last" : "/api/entries?perPage=10&page=1",
            "next" : null,
            "prev" : null,
            "self" : "/api/entries?perPage=10&page=1"
         },
         "_meta" : {
            "page" : 1,
            "perPage" : 10,
            "totalItems" : 1,
            "totalPages" : 1
         },
         "items" : [
            {
               "content" : "Then it dawned on me: there is no finish line!",
               "createdAt" : "2021-09-05T07:38:32.000Z",
               "id" : 1,
               "timestampInUTC" : "2020-12-01T15:17:00.000Z",
               "updatedAt" : "2021-09-05T07:38:32.000Z",
               "userId" : 1,
               "utcZoneOfTimestamp" : "+02:00"
            }
         ]
      }
      ```

      ```
      $ curl \
         -v \
         -H "Authorization: Bearer ${T2}" \
         localhost:${PORT}/api/entries \
         | json_pp
      
      ...
      < HTTP/1.1 200 OK
      < Content-Type: application/json; charset=utf-8
      < Content-Length: 451
      < Date: Sun, 05 Sep 2021 07:39:27 GMT
      < Connection: keep-alive
      < Keep-Alive: timeout=5
      < 
      { [451 bytes data]
      100   451  100   451    0     0  12885      0 --:--:-- --:--:-- --:--:-- 12885
      * Connection #0 to host localhost left intact
      * Closing connection 0
      {
         "_links" : {
            "first" : "/api/entries?perPage=10&page=1",
            "last" : "/api/entries?perPage=10&page=1",
            "next" : null,
            "prev" : null,
            "self" : "/api/entries?perPage=10&page=1"
         },
         "_meta" : {
            "page" : 1,
            "perPage" : 10,
            "totalItems" : 1,
            "totalPages" : 1
         },
         "items" : [
            {
               "content" : "Mallorca has beautiful sunny beaches!",
               "createdAt" : "2021-09-05T07:38:51.000Z",
               "id" : 2,
               "timestampInUTC" : "2019-08-20T13:17:00.000Z",
               "updatedAt" : "2021-09-05T07:38:51.000Z",
               "userId" : 2,
               "utcZoneOfTimestamp" : "+01:00"
            }
         ]
      }
      ```

   - launch a separate terminal instance and, in it, start a process responsible for serving the frontend application:
      ```
      frontend $ npm start
      ```
      and a tab in your operating system's default web browser should open up and load the address localhost:3000/
   </li>
</ul>

# How to use Vanilla Docker to run a containerized version of the project

Let us begin by indicating why it is worthwhile to be able to use Docker to run a containerized version of the project. The core information within this section and the next one is based on the "How to Dockerize a React + Flask Project" article by [Miguel Grinberg](https://blog.miguelgrinberg.com).

For starters, it is possible to deploy the project on an Ubuntu machine by using Node.js to serve the backend sub-project and, in front of that, setting up a dedicated static file and proxy web server (Nginx). While this deployment method works, it requires a lot of manual steps. As a consequence, this manual deployment method is, at best, tedious and, at worst, error-prone.

An alternative deployment method, which is almost entirely automated in nature, is made possible by Docker. In slightly more concrete terms, the Docker-based deployment method takes the manual deployment method's steps and encapsulates them in the form of a script (called a "Dockerfile"). The benefits of the Docker-based deployment method are as follows:
- executing a single command on an Ubuntu machine gets a deployment up and running
- it makes it possible to test locally and, once everything is working, the deployment method can be used within any environment that supports Docker, regardless of operating system or cloud platform

---

With regard to this project in particular, applying a Docker-based deployment method requires us:

   (a) to build 3 "Docker images":

   - one with the MySQL database engine
   - one with the backend application
   - one with the frontend application

   (b) to use the built Docker images to run "Docker containers" (because the Docker containers are the actual system processes that serve the different components of the project)

   (c) to orchestrate the Docker containers to run together as part of a "private (Docker) network"

---

The easiest way to achieve (a) through (c) - with a particular emphasis on (c)! - is to use Docker Compose. Even though Docker Compose makes the Docker-based deployment method almost entirely automated, it also does a few things "under the hood" that may remain unnoticed if one's experience with Docker is limited. Those things are creating a Docker network; creating a Docker volume; and attaching all running Docker containers to the Docker network.

In the hope of showing that those things are reasonably tractable, this section is going to achieve (a) through (c) without using Docker Compose at all. Instead, it is going to show the exact Docker commands, which need to be issued in order to create Docker network; create a Docker volume; build Docker images; and use the Docker images to run Docker containers attached to the created Docker network.

---

```
# inside the `backend` subfolder of your local repository,
# create a `.env` file with the following structure:

    ```
    SECRET_KEY=keep-this-value-known-only-to-the-deployment-machine

    MYSQL_RANDOM_ROOT_PASSWORD=yes
    MYSQL_USER=
    MYSQL_PASSWORD=
    MYSQL_DATABASE=

    DATABASE_TYPE=mysql
    DATABASE_HOSTNAME=journal-keeper-database-server
    DATABASE_PORT=3306
    DATABASE_USERNAME=<provide-the-same-value-as-for-MYSQL_USER>
    DATABASE_PASSWORD=<provide-the-same-value-as-for-MYSQL_PASSWORD>
    DATABASE_NAME=<provide-the-same-value-as-for-MYSQL_DATABASE>
    ```

# and also a `.env.prod-stage` file with the following structure:

    ```
    TYPEORM_CONNECTION=<provide-the-same-value-as-for-DATABASE_TYPE>
    TYPEORM_HOST=<provide-the-same-value-as-for-DATABASE_HOSTNAME>
    TYPEORM_USERNAME=<provide-the-same-value-as-for-MYSQL_USER>
    TYPEORM_PASSWORD=<provide-the-same-value-as-for-MYSQL_PASSWORD>
    TYPEORM_DATABASE=<provide-the-same-value-as-for-MYSQL_DATABASE>
    TYPEORM_PORT=<provide-the-same-value-as-for-DATABASE_PORT>
    TYPEORM_SYNCHRONIZE=false
    TYPEORM_LOGGING=true
    TYPEORM_ENTITIES=dist/entities.js
    ```
```

```
$ docker network create network-journal-keeper
```

```
$ docker volume create volume-journal-keeper-mysql

$ docker run \
   --name container-journal-keeper-mysql \
   --network network-journal-keeper \
   --network-alias <the-value-of-DATABASE_HOSTNAME> \
   --mount source=volume-journal-keeper-mysql,destination=/var/lib/mysql \
   --detach \
   --env-file=backend/.env \
   mysql:8.0.26 \
   --default-authentication-plugin=mysql_native_password
```

```
$ docker container ls -a
CONTAINER ID   IMAGE          COMMAND                  CREATED         STATUS         PORTS                 NAMES
84c4ebbaa10e   mysql:8.0.26   "docker-entrypoint.s…"   6 minutes ago   Up 6 minutes   3306/tcp, 33060/tcp   container-journal-keeper-mysql
$ docker exec -it container-journal-keeper-mysql bash
root@84c4ebbaa10e:/# mysql -u <the-value-of-MYSQL_USER> -p
Enter password: 
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 8
Server version: 8.0.26 MySQL Community Server - GPL

Copyright (c) 2000, 2021, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> SHOW DATABASES;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| <the-value-of-MYSQL_DATABASE>     |
+--------------------+
2 rows in set (0.02 sec)

mysql> use <the-value-of-MYSQL_DATABASE>;
Database changed
mysql> SHOW TABLES;
Empty set (0.01 sec)

mysql> exit;
Bye
root@84c4ebbaa10e:/# exit
exit
$
```

```
[
This step is optional but instructive
- it closely follows the documentation at https://docs.docker.com/get-started/07_multi_container/#connect-to-mysql
]

Now that we know [that one] MySQL [container] is up and running, let’s use it!
But, the question is... how?
If we run another container on the same network,
how do we find the [MySQL] container (remember each container has its own IP address)?

To figure it out, we’re going to make use of the `nicolaka/netshoot` [image],
which ships with a lot of tools that are useful for
troubleshooting or debugging networking issues.

   1. Start a new container using the `nicolaka/netshoot` image.
      Make sure to connect it to the same network.

      $ docker run \
         --name container-nicolaka-netshoot \
         -it \
         --rm \
         --network network-journal-keeper \
         nicolaka/netshoot
   
   2. Inside the container, we’re going to use the `dig` command,
      which is a useful DNS tool.
      We’re going to look up the IP address for the hostname `<the-value-of-DATABASE_HOSTNAME>`.

      ```
       487fc9c5b3fe  ~  dig <the-value-of-DATABASE_HOSTNAME>
      ```

      And you’ll get an output like this...

      ```
      ; <<>> DiG 9.16.19 <<>> <the-value-of-DATABASE_HOSTNAME>
      ;; global options: +cmd
      ;; Got answer:
      ;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 23978
      ;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 0

      ;; QUESTION SECTION:
      ;<the-value-of-DATABASE_HOSTNAME>.        IN      A

      ;; ANSWER SECTION:
      <the-value-of-DATABASE_HOSTNAME>. 600 IN  A       172.21.0.2

      ;; Query time: 15 msec
      ;; SERVER: 127.0.0.11#53(127.0.0.11)
      ;; WHEN: Sun Sep 19 08:59:45 UTC 2021
      ;; MSG SIZE  rcvd: 94
      ```

      In the “ANSWER SECTION”,
      you will see an `A` record for `<the-value-of-DATABASE_HOSTNAME>`
      that resolves to 172.21.0.2
      (your IP address will most likely have a different value).
      While `<the-value-of-DATABASE_HOSTNAME>` isn’t normally a valid hostname,
      Docker was able to resolve it to the IP address of the container
      [which had been assigned] that network alias
      (remember the `--network-alias` flag we used earlier?).

      What this means is [that] our app
      only ... needs to connect to a host named `<the-value-of-DATABASE_HOSTNAME>`
      and it’ll talk to the database!
      It doesn’t get much simpler than that!
```

```
$ export HYPHENATED_YYYY_MM_DD_HH_MM=2021-09-23-08-54
```

```
docker build \
   --file Dockerfile.backend \
   --tag image-journal-keeper-backend:build-stage-${HYPHENATED_YYYY_MM_DD_HH_MM} \
   --target build-stage \
   .

docker run \
   --network network-journal-keeper \
   --rm \
   --env-file backend/.env \
   image-journal-keeper-backend:build-stage-${HYPHENATED_YYYY_MM_DD_HH_MM} \
   ts-node ./node_modules/typeorm/cli \
      -f ./ormconfig.ts \
      migration:run \
      -c connection-to-db-for-dev
```

```
docker run \
   --network network-journal-keeper \
   --network-alias alias-for-backend-container \
   --rm \
   --env-file backend/.env \
   --mount type=bind,source="$(pwd)"/backend/src,destination=/journal-keeper/backend/src \
   image-journal-keeper-backend:build-stage-${HYPHENATED_YYYY_MM_DD_HH_MM} \
   nodemon \
      --watch src \
      --ext ts \
      --exec "npm run serve"

# In a new terminal window:
docker build \
   --file Dockerfile.frontend \
   --tag image-journal-keeper-frontend:build-stage-${HYPHENATED_YYYY_MM_DD_HH_MM} \
   --target build-stage \
   .

# If you include the `-it` command-line flag in the next command,
# (some of) the output in the terminal window will be colored
# (as when running `npm start` locally).
docker run \
   --network network-journal-keeper \
   --rm \
   --publish 3000:3000 \
   --mount type=bind,source="$(pwd)"/frontend/src,destination=/journal-keeper/frontend/src \
   image-journal-keeper-frontend:build-stage-${HYPHENATED_YYYY_MM_DD_HH_MM} \
   npm start

# Launch another terminal instance
# and, in it, issue firstly:
$ export PORT=3000

# Secondly and optionally,
# you may issue the requests that are documented at the end of the previous section.

# Use a web browser to interact with the frontend UI.

# Stop serving the backend and the frontend
# by hitting `Ctrl+C` in each of the 2 relevant terminal windows.
```

```
docker build \
   --file Dockerfile.backend \
   --tag image-journal-keeper-backend:prod-stage-${HYPHENATED_YYYY_MM_DD_HH_MM} \
   --target=prod-stage \
   .

docker run \
   --name container-journal-keeper-backend-prod-stage \
   --network network-journal-keeper \
   --network-alias service-backend \
   --rm \
   --env-file backend/.env \
   --env-file backend/.env.prod-stage \
   --env NODE_ENV=prod \
   --publish 5000:5000 \
   --detach \
   image-journal-keeper-backend:prod-stage-${HYPHENATED_YYYY_MM_DD_HH_MM} \
   node dist/server.js

docker build \
   --file Dockerfile.frontend \
   --tag image-journal-keeper-frontend:prod-stage-${HYPHENATED_YYYY_MM_DD_HH_MM} \
   --target prod-stage \
   .

docker run \
   --name container-journal-keeper-frontend-prod-stage \
   --network network-journal-keeper \
   --rm \
   --publish 3000:80 \
   --detach \
   image-journal-keeper-frontend:prod-stage-${HYPHENATED_YYYY_MM_DD_HH_MM}

# Launch another terminal instance
# and, in it, issue firstly:
$ export PORT=3000

# Secondly and optionally,
# you may issue the requests that are documented at the end of the previous section.

# Use a web browser to interact with the frontend UI.

# Stop running all containers,
# remove the created Docker volume,
# and remove the created Docker network
# by issuing:
$ ./clean-docker-artifacts.sh
```

# How to use Docker Compose to run a containerized version of the project

The previous section demonstrated how to use "Vanilla Docker" (i.e. Docker without Docker Compose) to run a containerized version of the project. That approach works, but it has the following few inconvenient aspects:

- it relies on not one but two environment files (`backend/.env` an `backend/.env.prod-stage`)
- there is duplication between the values that those files stored in environment variables
- there is also duplication between the values that `backend/.env` alone stored in environment variables
- even though it uses fewer commands than the "manual deployment method" described in the previous section, each of those commands is long and complex

This section demonstrates how to use Docker Compose to run a containerized version of the project. This section's approach rectifies the inconvenient aspects of the previous section's approach (which were listed in the previous paragraph) and, in so doing, achieves a slightly higher degree of automation.

---

```
# inside the root folder of your local repository,
# create a `.env.docker-compose` file with the following structure:

    ```
    SECRET_KEY=

    DB_ENGINE_TYPE=mysql
    DB_ENGINE_HOSTNAME=
    DB_ENGINE_PORT=3306
    DB_ENGINE_DATABASE=
    DB_ENGINE_USERNAME=
    DB_ENGINE_PASSWORD=
    ```

    (
    Recall that, earlier in this `README.md`,
    it was indicated how to generate a "good secret key".
    )
```

---

1. run the `build-stage`, which will:
   - create a Docker network
   - run a Docker container (attached to the Docker network; representing the persistence layer, which the backend application relies on; and running the MySQL database engine, in which a new database is created [without any tables yet])
   - create a Docker volume (responsible for persisting all contents of the database, i.e. the database schema itself and also - once the whole application stack has been started! - any records written to the database)
   - run a Docker container (attached to the Docker network; containing the backend application; and running all database-migration scripts plus, right after that, exiting)
   - run a Docker container (attached to the Docker network; containing the frontend application; and exiting immediately)

   ```
   $ docker-compose \
      --env-file .env.docker-compose \
      --file docker-compose.build-stage.yml \
      up
   ```

2. at this stage, all containers except for the _database container_ should have exited; terminate the process in the terminal by first pressing `Ctrl+C`, and then issue:
   ```
   $ docker container rm -f \
      container-journal-keeper-database-server \
      container-journal-keeper-backend-build-stage \
      container-journal-keeper-frontend-build-stage
   ```

3. unless you wish to utilize the images built so far for local development (with hot reloading upon changes to the TypeScript source code of either the backend or of the frontend!), you can skip this step and go on to the next one; otherwise, issue the following commands:

   ```
   $ docker-compose \
      --env-file .env.docker-compose \
      --file docker-compose.build-stage.yml \
      run \
         --name container-journal-keeper-backend-build-stage \
         --use-aliases \
         --publish 5000:5000 \
         -v "$(pwd)"/backend/src:/journal-keeper/backend/src \
         service-backend \
         nodemon \
            --watch src \
            --ext ts \
            --exec "npm run serve"

   # Notice that, if you make a change to the TypeScript source code of the backend,
   # saving the changed file will trigger `nodemon` to re-run `npm run serve`
   # (which achieves the effect of serving the changed backend).

   # As a sanity check, it is recommended you should verify
   # that you can interact with the backend.
   # For example, launch another terminal instance
   # and, in it, use `curl` to create 1 new user.
   ```

   ```
   # Launch another terminal instance
   # and, in it, issue:

   $ sed \
      's/localhost:5000/service-backend:5000/g' \
      frontend/package.json \
      > frontend/ignore-me.package.json

   $ docker-compose \
      --env-file .env.docker-compose \
      --file docker-compose.build-stage.yml \
      run \
         --name container-journal-keeper-frontend-build-stage \
         --publish 3000:3000 \
         -v "$(pwd)"/frontend/ignore-me.package.json:/journal-keeper/frontend/package.json \
         -v "$(pwd)"/frontend/src:/journal-keeper/frontend/src \
         service-frontend \
         npm start
   
   # Use a web browser to interact with the frontend UI.
   ```

4. run the `prod-stage`:

   ```
   $ docker-compose \
      --env .env.docker-compose \
      --file docker-compose.build-stage.yml \
      --file docker-compose.prod-stage.yml \
      up
   
   $ docker container rm -f \
      container-journal-keeper-database-server \
      container-journal-keeper-backend-prod-stage \
      container-journal-keeper-frontend-prod-stage
   ```

# Future plans

- modularize the backend

- modularize the frontend

- implement a password-reset functionality

- allow each user to export their personal data in JSON format

- require every newly-created user to confirm their email address

- implement a functionality for assigning tags to a post (i.e. enable the user to create categories/tags and to label each of his/her posts with 1 or several categories/tags)
