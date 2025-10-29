Run your WSL and connect to your user, CREATE TWO DATABASES, 

1- CREATE DATABASE shopi;

2- CREATE DATABASE shopitest;

Make sure to change what you have to in .env and database.json

The Backend port is 3001, the db port is 5432

Required Technologies.
Your application must make use of the following libraries:


Postgres for the database
Node/Express for the application logic
dotenv from npm for managing environment variables
db-migrate from npm for migrations
jsonwebtoken from npm for working with JWTs
jasmine from npm for testing



After creating both databases, do the following:

npm run migrate        // to migrate up the dev db

npm run migrate:test   // to migrate up the test db


then do   npm test      to run test

then do   npm run dev   to run dev

###.env

ENV=dev
PORT=3001


POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432
POSTGRES_DB=shopi
POSTGRES_USER=postgres
POSTGRES_PASSWORD=ali122


BCRYPT_PASSWORD=pepper1234567890
SALT_ROUNDS=10
JWT_SECRET=supersecretkey1234



reminder: Make sure to change what you have to in .env and database.json


