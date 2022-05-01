v0.1 (2021/09/17)
-----------------

``JournalKeeper`` is a web application that allows the user to keep a personal journal online.

Its implementation is composed of a backend sub-project and a frontend sub-project.

The backend sub-project uses the following technologies:

- TypeScript

- Koa.js

- MySQL

- Jest

The frontend sub-project uses the following technologies:

- TypeScript

- React

- React-Router

- Redux

- Axios

- Redux-Thunk

- Jest

v0.2 (2021/09/26)
-----------------

- enable using Docker containers for local development and for deployment

- change the datatype of the `entries.content` column to `text` (from `varchar(255)`) + make the frontend look slightly better

v0.3 (2022/05/01)
-----------------

- improve the Docker-based way of running a containerized version of the project (by replacing an external dependecy with a set of own scripts)

- improve the pagination of `Entry` resources (in the frontend)

- add a `LICENSE` file

- add a `CHANGELOG.rst` file
