const { Client } = require("pg");

const SQL = `
CREATE TABLE IF NOT EXISTS members (
    first_name VARCHAR (255),
    last_name VARCHAR (255),
    username VARCHAR (255),
    password VARCHAR (255),
    status VARCHAR (255)
);

CREATE TABLE IF NOT EXISTS messages (
    message_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    message VARCHAR (255),
    title VARCHAR (255),
    timestamp TIMESTAMP,
    username VARCHAR (255),
    first_name VARCHAR (255)
);
`;

async function main() {
  console.log("generating...");
  const client = new Client({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASS,
    database: process.env.DB,
    port: process.env.PORT,
  });
  await client.connect();
  await client.query(SQL);
  await client.end();
  console.log("Generating complete!");
}

main();
