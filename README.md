# Mockdb [![NPM version](https://img.shields.io/npm/v/g-mapify.svg)](https://www.npmjs.com/package/g-mapify) [![Downloads](http://img.shields.io/npm/dm/g-mapify.svg)](https://npmjs.org/package/g-mapify)
> Create and manage local mock databases using mongodb like filters.

## Table of Contents
  - [Installation](#installation)
  - [Database](#database)
  - [Collections](#collection)
  - [Filter](#filter)
  - [Update](#update)
  - [Contact](#contact)
  - [License](#license)


## Installation

```javascript
npm i mockdb
```

## Database

Create a new database , connect to an existing database or remove an existing database with the MockDb static methods 

Databases are represented as subdirectories of the root MockDb directory that is created when creating the 1st database for the project.

```
project
│       
└─── mockdb
│    └─── testdb
│    └─── testdb2
```

```javascript
import {Mockdb, Db} from 'mockdb';

//create new db connection and connection
const connection = MockDb.createDb('testDb');

//connect to an existing database
//const connection = MockDb.connect('existingDb');

//remove an existing db
//await MockDb.removeDb('existingDb')

```

## Contact
Created by [@flynerdpl](https://www.flynerd.pl/) - feel free to contact me!


<!-- Optional -->
<!-- ## License -->
<!-- This project is open source and available under the [... License](). -->

<!-- You don't have to include all sections - just the one's relevant to your project -->