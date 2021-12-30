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
