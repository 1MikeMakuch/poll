# poll

Note: This does not implement everything. There is no authentication, no apis for reporting statistics.

It allows the test-run to create users, polls, run a poll and notify. Updates poll status.

There are no foreign key constraints, I chose this simply to save time. I took a lot of short cuts.

It doesn't scale at all, obviously. I'd be happy to go over and discuss ways to scale it.


It's working on my laptop with mysql 8, node 16;

```
$ mysqlroot -E -Dpoll <<< 'select version()'
*************************** 1. row ***************************
version(): 8.0.26

$ node --version
v16.13.0
```

```
$ cd server
$ yarn install
```

Also you need a .env in the server dir with these vars;
```
SERVER_PORT=9091
SERVER_URL="http://localhost:9091"

APP_KEY=asdf234

SESSION_SECRET=xyzzy123

ENVIRONMENT=development

DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=poll
DB_USER=poll
DB_PASSWORD=poll
```

and you need to init your db with `server/schema/install.sql`, it creates everything and loads the schema.

api tests run against the server on it's default port 9091

```
$ cd server
$ yarn debug
```

All of the tests succeed, most are boiler plate crud ops. The interesting one is `server/src/test/run_a_poll.js`

```
$ cd server
$ yarn test-all
```
runs all tests.

```
$ yarn test-run
```
Only runs the `test-run` test which just goes through creating users, a poll, sends (mock) notifications, updates poll status.
