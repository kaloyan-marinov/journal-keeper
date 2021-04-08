```
$ ./node_modules/.bin/tsc --version
Version 4.2.3
$ ll ./node_modules/.bin/tsc 
lrwxr-xr-x  1 <user>  <group>    21B Apr  7 07:07 ./node_modules/.bin/tsc@ -> ../typescript/bin/tsc
```

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

3. there are two options for running the project

    (a) first, compile the whole project by issuing

    ```
    $ ./node_modules/.bin/tsc
    ```

    which is going to create a `dist` folder containing JavaScript files (as the result result of the compilation process):

    ```
    $ ll dist/
    total 8
    drwxr-xr-x   3 <user>  <group>    96B Apr  7 08:13 ./
    drwxr-xr-x  11 <user>  <group>   352B Apr  7 08:13 ../
    -rw-r--r--   1 <user>  <group>   193B Apr  7 08:14 server.js
    ```

    second, run the compiled project by issuing

    ```
    $ node dist/server.js
    Server listening on port 3000
    ```

    (b) run the whole project by issuing

    ```
    $ ./node_modules/.bin/ts-node src/server.ts
    Server listening on port 3000
    ```
