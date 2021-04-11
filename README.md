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

1. recall the values for `"rootDir"` and `"outDir"` that are specified in the `tsconfig.json` file

2. recognize that the `src` folder contains a(n admittedly minimal) software project, which is written in valid TypeScript

    ```
    $ ll src/
    total 8
    drwxr-xr-x   3 <user>  <group>    96B Apr  7 07:58 ./
    drwxr-xr-x  11 <user>  <group>   352B Apr  7 08:13 ../
    -rw-r--r--   1 <user>  <group>   195B Apr  7 08:13 server.ts
    ```

3. the ways of running the project can be broken down into two categories

    (a) without re-starting the project when changes are made
    
      - (approach a.1): first, compile the whole project by issuing `$ ./node_modules/.bin/tsc`, which is going to create a `dist` folder containing JavaScript files (as the result result of the compilation process); second, run the compiled project by issuing `$ node dist/server.js`

      - (approach a.2): directly run the whole project by issuing `$ ./node_modules/.bin/ts-node src/server.ts` or `$ npm run serve`

    (b) in such a way that the project is re-started whenever changes are made

      - (approach b.1): directly run the compiled project by issuing `$ ./node_modules/.bin/nodemon` or `$ npm run start` (or, even more succunctly, `$ npm start` ); _this approach ensures that the project will be re-started whenever changes are made to the `src/server.ts` file_

---

```
$ curl \
  -i \
  localhost:3000/api/users

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 30
Date: Fri, 09 Apr 2021 05:34:07 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"1":{"id":1,"username":"jd"}}
```

```
$ curl \
  -i \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username": "ms", "name": "Mary Smith", "email": "mary.smith@protonmail.com", "password": "456"}' \
  localhost:3000/api/users

HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
Content-Length: 24
Date: Fri, 09 Apr 2021 05:34:40 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":2,"username":"ms"}



$ curl -i localhost:3000/api/users

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 59
Date: Fri, 09 Apr 2021 05:35:02 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"1":{"id":1,"username":"jd"},"2":{"id":2,"username":"ms"}}
```