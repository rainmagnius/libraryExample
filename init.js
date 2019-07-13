'use stcict';
const config = require('config');
const mysql = require('mysql2');

const authorTableDefinition =
`CREATE TABLE IF NOT EXISTS author (
  id INT AUTO_INCREMENT,
  firstname VARCHAR(255) NOT NULL,
  lastname VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
);`;

const bookTableDefinition =
`CREATE TABLE IF NOT EXISTS book (
  id INT AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  date DATE,
  author_id INT,
  description TEXT,
  image VARCHAR(255),
  PRIMARY KEY (id),
  FOREIGN KEY (author_id)
    REFERENCES author(id)
    ON DELETE SET NULL
);`;

const authors = [['Neal', 'Stephenson'], ['Ray', 'Bradbury'], ['Philip', 'Dick'], ['George', 'Orwell'], ['Franz', 'Kafka']];
const firstnames = ['Sierra', 'Margeret', 'Tommy', 'Tanja', 'Shawnee', 'Herminia', 'Lorraine', 'Jamar', 'Ann', 'Kirk'];
const lastnames = ['Champagne', 'Ballard', 'Haugland', 'Bird', 'Desjardin', 'Drake', 'Gauthier', 'Kurek', 'Broman', 'Mantilla'];

const books = [
  ['Snow Crash', '1992-06-01', 1, 'History about Hiro Protagonist who fight with virus that’s striking down hackers everywhere.', '/uploads/snowcrash.jpg'],
  ['Fahrenheit 451', '1953-10-19', 2, 'Guy Montag is a fireman. His job is to destroy the printed book, along with the houses in which they are hidden.', '/uploads/fahrenheit.jpg'],
  ['Do Androids Dream of Electric Sheep?', '1968-01-01', 3, `Rick Deckard is an officially sanctioned bounty hunter tasked to find six rogue androids. They're machines, but look, sound, and think like humans`, '/uploads/dadoes.jpg'],
  ['1984', '1949-06-08', 4, 'Big Brother is always watching you and the Thought Police can practically read your mind. Winston Smith is a man in grave danger for the simple reason that his memory still functions.', '/uploads/1984.jpg'],
  ['The Trial', '1925-01-01', 5, 'K. later receives a phone call summoning him to court, and the coming Sunday is arranged as the date. No time is set, but the address is given to him...', '/uploads/trial.jpg'],
];

const titles = [`Rose`, `The End of the World`, `The Unquiet Dead`, `Aliens of London`, `World War Three`, `Dalek`, `The Long Game`, `Father's Day`,
                `The Empty Child`, `The Doctor Dances`, `Boom Town`, `Bad Wolf`, `The Parting of the Ways`]
const descriptions = [
`Yesterday`,
`All my troubles seemed so far away`,
`Now it looks as though they're here to stay`,
`Oh, I believe in yesterday`,
`Suddenly`,
`I'm not half the man I used to be`,
`There's a shadow hanging over me`,
`Oh, yesterday came suddenly`,
`Why she had to go, I don't know`,
`She wouldn't say`,
`I said something wrong`,
`Now I long for yesterday`,
`Yesterday`,
`Love was such an easy game to play`,
`Now I need a place to hide away`,
`Oh, I believe in yesterday`,
`Why she had to go, I don't know`,
`She wouldn't say`,
`I said something wrong`,
`Now I long for yesterday`,
`Yesterday`,
`Love was such an easy game to play`,
`Now I need a place to hide away`,
`Oh, I believe in yesterday`,
];

function getRandomValueFromArray(array) {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  const dbconf = { ...config.database };
  delete dbconf.database;
  const connection = mysql.createConnection(dbconf).promise();

  await connection.query(`CREATE DATABASE ${config.database.database};`);
  await connection.query(`USE ${config.database.database};`);
  await connection.query(authorTableDefinition);
  await connection.query(bookTableDefinition);
  lastnames.forEach(l => {
    const f = getRandomValueFromArray(firstnames);
    authors.push([f, l]);
  });

  await connection.query(`INSERT INTO author (firstname, lastname) VALUES ?;`, [authors]);

  for (let i = 0; i < 100000; i++) {
    books.push([
      getRandomValueFromArray(titles),
      getRandomDate(new Date(1928, 0, 1), new Date()),
      Math.ceil(Math.random() * (15 - 5) + 5 ),
      getRandomValueFromArray(descriptions),
    ]);
  }

  await connection.query(`INSERT INTO book (title, date, author_id, description) VALUES ?;`, [books]);
  connection.end();
  console.log('done!')
}

main().catch(console.error);