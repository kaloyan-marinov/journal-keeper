```
$ ./node_modules/.bin/tsc --version
Version 4.2.3
$ ll ./node_modules/.bin/tsc 
lrwxr-xr-x  1 <user>  <group>    21B Apr  7 07:07 ./node_modules/.bin/tsc@ -> ../typescript/bin/tsc
```

---

1. to run the tests once, issue any one of the following:

    ```
    $ ./node_modules/.bin/jest
    ```

    ```
    $ npm run test
    ```

    ```
    $ npm test
    ```

    which will create a `coverage/` folder with a report of test coverage; to view that report, open `coverage/index.html` in your web browser

2. to run the tests in watch mode, issue any one of the following:

    ```
    $ ./node_modules/.bin/jest --watchAll
    ```

    ```
    $ npm run test--watchAll
    ```

    each re-run of which will update the contents of the `coverage/` folder

---

to create an SQLite database:

1. specifiy `DATABASE_URL` in `.env`

2. to create a new migration script, issue one of the following:
    
    ```
    $ ./node_modules/.bin/ts-node \
      ./node_modules/typeorm/cli.js \
      migration:generate \
      -c connection-to-db-for-dev \
      -n <newMigrationScript>
    ```

    or

    ```
    $ npm run migration:generate -- \
      -c connection-to-db-for-dev \
      -n <newMigrationScript>
    ```

3. to run all migration scripts that haven't been applied yet, issue one of the following:

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

---

1. recall the values for `"rootDir"` and `"outDir"` that are specified in the `tsconfig.json` file

2. recognize that the `src` folder contains a(n admittedly small) software project, which is written in valid TypeScript; uses Koa.js and SQLite; and includes a test suite

    ```
    $ tree src/
    src/
    ├── entities.ts
    ├── migration
    │   └── 1618138069642-createUsersTable.ts
    └── server.ts

    1 directory, 3 files
    ```

3. the ways of running the project can be broken down into two categories

    (a) without re-starting the project when changes are made
    
      - (approach a.1): first, compile the whole project by issuing `$ ./node_modules/.bin/tsc`, which is going to create a `dist` folder containing JavaScript files (as the result result of the compilation process) as well as an `ormconfig.js` file; second, run the compiled project by issuing `$ NODE_ENV=production node dist/server.js`

      - (approach a.2): directly run the whole project by issuing `$ ./node_modules/.bin/ts-node src/server.ts` or `$ npm run serve`

    (b) in such a way that the project is re-started whenever changes are made

      - (approach b.1): directly run the compiled project by issuing `$ ./node_modules/.bin/nodemon` or `$ npm run start` (or, even more succunctly, `$ npm start` ); _this approach ensures that the project will be re-started whenever changes are made to the `src/server.ts` file_

---

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