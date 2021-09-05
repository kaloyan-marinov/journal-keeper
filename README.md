# Table of contents

This repository's documentation is organized as follows.

1. [Introduction](#introduction)

2. [The functionality provided by the web application](#the-functionality-provided-by-the-web-application)

3. [How to set up the project for local development](#how-to-set-up-the-project-for-local-development)

4. [Different options for serving our backend application](#different-options-for-serving-our-backend-application)

5. [Future plans](#future-plans)

# Introduction

`JournalKeeper` is a web application that allows the user to keep a personal journal online.

I decided to build such an application, because (a) sometimes I will journal about past or present expriences; (b) occasionally I will write down a particularly vivid dream; and (c) I regularly take notes about things that strike me as important or interesting.

As of September 2021, my journaling has used up several notebooks. My plan is for this web application to provide a centralized place for my future journal entries.

# The functionality provided by the web application

In a nutshell, `JournalKeeper` allows the user to keep a personal journal online.

The first step is for you to create a `JournalKeeper` account, which will store and protect your data.

Next, you can log into your account and create your own journal entries therein.

# How to set up the project for local development

1. clone this repository, and navigate into your local repository

2. inside the `backend` subfolder of your local repository, create a `.env` file with the following structure:
    ```
    SECRET_KEY=<specify-a-good-secret-key-here>

    DATABASE_URL=sqlite:///<absolute-path-starting-with-a-leading-slash-and-pointing-to-an-SQLite-file>
    ```
    (For deployment, you should generate a "good secret key" and store that value in `SECRET_KEY` within the `.env` file; to achieve that, take a look at the "How to generate good secret keys" section on https://flask.palletsprojects.com/en/1.1.x/quickstart/ . For local development, something like `keep-this-value-known-only-to-the-deployment-machine` should suffice.)

3. set up the backend:

   - install the Node.js dependencies:

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

   - create an empty SQLite database and apply all database migrations by issuing one of the following:

      ```
      backend $ ./node_modules/.bin/ts-node \
         ./node_modules/typeorm/cli.js \
         migration:run \
         -c connection-to-db-for-dev
      ```

      or

      ```
      backend $ npm run migration:run -- \
         -c connection-to-db-for-dev
      ```

   - verify that the previous step was successful by issuing `$ sqlite3 <the-value-of-DATABASE_URL-in-your-.env-file>` and then issuing:
      
      ```
      SQLite version 3.32.3 2020-06-18 14:16:19
      Enter ".help" for usage hints.
      sqlite> .tables
      entries     migrations  users     
      sqlite> .schema users
      CREATE TABLE IF NOT EXISTS "users" (
         "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
         "username" varchar(255) NOT NULL,
         "name" varchar(255) NOT NULL,
         "email" varchar(255) NOT NULL,
         "password_hash" varchar(255) NOT NULL,
         "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
         "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
         CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"),
         CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")
      );
      sqlite> .schema entries
      CREATE TABLE IF NOT EXISTS "entries" (
         "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
         "timestamp_in_utc" datetime NOT NULL,
         "utc_zone_of_timestamp" varchar NOT NULL,
         "content" varchar NOT NULL,
         "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
         "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
         "user_id" integer NOT NULL,
         CONSTRAINT "FK_73b250bca5e5a24e1343da56168" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
      );
      ```

   - launch a terminal instance and, in it, start a process responsible for serving the backend application instance; the ways of starting such a process can be broken down into the following categories:

      (a) without re-starting the project when changes are made
      
        - (approach a.1): first, compile the whole project by issuing `backend $ ./node_modules/.bin/tsc`, which is going to create a `dist` subfolder containing JavaScript files (as the result result of the compilation process) as well as an `ormconfig.js` file; second, run the compiled project by issuing `backend $ NODE_ENV=production node dist/server.js`

        - (approach a.2): directly run the whole project by issuing `backend $ ./node_modules/.bin/ts-node src/server.ts` or `backend $ npm run serve`

      (b) in such a way that the project is re-started whenever changes are made

        - (approach b.1): directly run the compiled project by issuing `backend $ ./node_modules/.bin/nodemon` or `backend $ npm run dev`; _this approach ensures that the project will be re-started whenever changes are made to the `src/server.ts` file_

   - launch another terminal window and, in it, issue the following requests:

      ```
      $ curl \
         -v \
         -X POST \
         -H "Content-Type: application/json" \
         -d '{"username": "jd", "name": "John Doe", "email": "john.doe@protonmail.com", "password": "123"}' \
         localhost:5000/api/users \
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
         localhost:5000/api/users \
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
         localhost:5000/api/users \
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
         localhost:5000/api/users \
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
         localhost:5000/api/tokens \
         | json_pp

      $ export T1=<the-value-of-the-returned JWS-token>
      ```

      ```
      $ curl \
         -v \
         -X POST \
         -u mary.smith@protonmail.com:456 \
         localhost:5000/api/tokens \
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
         localhost:5000/api/entries \
         | json_pp
      ```

      ```
      $ curl \
         -v \
         -X POST \
         -H "Authorization: Bearer ${T2}" \
         -H "Content-Type: application/json" \
         -d '{"timezone": "+01:00", "localTime": "2019-08-20 14:17", "content": "Mallorca has beautiful sunny beaches!"}' \
         localhost:5000/api/entries \
         | json_pp
      ```

      ```
      $ curl \
         -v \
         -H "Authorization: Bearer ${T1}" \
         localhost:5000/api/entries \
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
         localhost:5000/api/entries \
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

4. set up the frontend:

   - install the Node.js dependencies:

      ```
      frontend $ npm install
      ```

   - ensure that running the tests results in a PASS by issuing the following:

      ```
      frontend $ npm test -- --coverage
      ```

      which will create a `coverage` subfolder with a report of test coverage; to view that report, open `coverage/lcov-report/index.html` in your web browser

      (to run the tests in watch mode, issue any one of the following: `frontend $ npm test -- --coverage --watchAll`; each re-run of which will update the contents of the `coverage` subfolder)

   - launch a terminal instance and, in it, start a process responsible for serving the frontend application:

      ```
      frontend $ npm start
      ```

# Different options for serving our backend application

TBD

# Future plans

- implement a password-reset functionality

- allow each user to export their personal data in JSON format

- require every newly-created user to confirm their email address

- implement a functionality for assigning tags to a post (i.e. enable the user to create categories/tags and to label each of his/her posts with 1 or several categories/tags)
