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

npm run migrate       // to migrate up the dev db

npm run migrate:test  // to migrate up the test db


then do   npm test      to run test

then do   npm run dev   to run dev
