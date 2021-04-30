# Brief introductory remarks

1. concerning the `backend` subfolder:

   - note the version of TypeScript:

      ```
      backend $ ./node_modules/.bin/tsc --version
      Version 4.2.3
      backend $ ll ./node_modules/.bin/tsc 
      lrwxr-xr-x  1 <user>  <group>    21B Apr  7 07:07 ./node_modules/.bin/tsc@ -> ../typescript/bin/tsc
      ```

   - recall the values for `"rootDir"` and `"outDir"` that are specified in the `backend/tsconfig.json` file

   - recognize that the `backend/src` folder contains a(n admittedly small) backend web application, which is written in valid TypeScript; uses Koa.js and SQLite; and includes a test suite

      ```
      $ tree backend/src/
      backend/src/
      ├── entities.ts
      ├── migration
      │   ├── 1618138069642-createUsersTable.ts
      │   ├── 1618908389832-createEntriesTable.ts
      │   └── 1619667023165-switchToStoringPasswordsInHashedForm.ts
      └── server.ts

      1 directory, 5 files
      ```

2. concerning the `frontend` subfolder:

   - TBD

# How to set up the project locally

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
      $ npm install
      ```

   - ensure that running the tests results in a PASS by issuing any one of the following:

      ```
      $ ./node_modules/.bin/jest
      ```

      ```
      $ npm run test
      ```

      ```
      $ npm test
      ```

      which will create a `coverage` folder with a report of test coverage; to view that report, open `coverage/index.html` in your web browser

      (to run the tests in watch mode, issue any one of the following: `$ ./node_modules/.bin/jest --watchAll` or `$ npm run test--watchAll`; each re-run of which will update the contents of the `coverage` folder)

   - create an empty SQLite database and apply all database migrations by issuing one of the following:

      ```
      $ ./node_modules/.bin/ts-node \
      ./node_modules/typeorm/cli.js \
      migration:run \
      -c connection-to-db-for-dev
      ```

      or

      ```
      $ npm run migration:run -- \
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
         CONSTRAINT "FK_73b250bca5e5a24e1343da56168" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION);
      ```

   - launch a terminal instance and, in it, start a process responsible for serving the backend application instance; the ways of starting such a process can be broken down into the following categories:

      (a) without re-starting the project when changes are made
      
        - (approach a.1): first, compile the whole project by issuing `$ ./node_modules/.bin/tsc`, which is going to create a `dist` folder containing JavaScript files (as the result result of the compilation process) as well as an `ormconfig.js` file; second, run the compiled project by issuing `$ NODE_ENV=production node dist/server.js`

        - (approach a.2): directly run the whole project by issuing `$ ./node_modules/.bin/ts-node src/server.ts` or `$ npm run serve`

      (b) in such a way that the project is re-started whenever changes are made

        - (approach b.1): directly run the compiled project by issuing `$ ./node_modules/.bin/nodemon` or `$ npm run start` (or, even more succunctly, `$ npm start` ); _this approach ensures that the project will be re-started whenever changes are made to the `src/server.ts` file_

   - launch another terminal window and, in it, issue the following requests:

      ```
      $ curl \
      -v \
      -X POST \
      -H "Content-Type: application/json" \
      -d '{"username": "jd", "name": "John Doe", "email": "john.doe@protonmail.com", "password": "123"}' \
      localhost:3000/api/users \
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
      localhost:3000/api/users \
      | json_pp

      ...
      < HTTP/1.1 200 OK
      < Content-Type: application/json; charset=utf-8
      < Content-Length: 36
      < Date: Sun, 18 Apr 2021 07:36:42 GMT
      < Connection: keep-alive
      < Keep-Alive: timeout=5
      <
      ...
      {
         "users" : [
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
      localhost:3000/api/users \
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
      localhost:3000/api/users \
      | json_pp
      
      ...
      < HTTP/1.1 200 OK
      < Content-Type: application/json; charset=utf-8
      < Content-Length: 61
      < Date: Sun, 18 Apr 2021 07:41:22 GMT
      < Connection: keep-alive
      < Keep-Alive: timeout=5
      < 
      ...
      {
         "users" : [
            {
               "id" : 1,
               "username" : "jd"
            },
            {
               "username" : "ms",
               "id" : 2
            }
         ]
      }
      ```

      ```
      $ curl \
         -v \
         -X POST \
         -u john.doe@protonmail.com:123 \
         localhost:3000/api/tokens \
         | json_pp

      $ export T1=<the-value-of-the-returned JWS-token>
      ```

      ```
      $ curl \
         -v \
         -X POST \
         -u mary.smith@protonmail.com:456 \
         localhost:3000/api/tokens \
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
         localhost:3000/api/entries \
         | json_pp
      ```

      ```
      $ curl \
         -v \
         -X POST \
         -H "Authorization: Bearer ${T2}" \
         -H "Content-Type: application/json" \
         -d '{"timezone": "+01:00", "localTime": "2019-08-20 14:17", "content": "Mallorca has beautiful sunny beaches!"}' \
         localhost:3000/api/entries \
         | json_pp
      ```

      ```
      $ curl \
         -v \
         -H "Authorization: Bearer ${T1}" \
         localhost:3000/api/entries \
         | json_pp
      ```

4. set up the frontend:

   - TBD