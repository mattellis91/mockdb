# Mockdb 
> Create and manage local mock document orientated databases using mongodb like filters.

## Table of Contents
  - [Database](#database)
  - [Collections](#collection)
  - [Filter](#filter)
  - [Update](#update)
  - [Contact](#contact)
  - [License](#license)


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
import { Mockdb } from 'mockdb';

//create new db connection and connection
const connection = MockDb.createDb('testDb');

//connect to an existing database
//const connection = MockDb.connect('existingDb');

//remove an existing db
//await MockDb.removeDb('existingDb')

```

## Collections

Manage collections of documents. Collections are represented as json files inside the relevant database subdirectory.

```
project
│       
└─── mockdb
│    └─── testdb
│    │    └─── testCollection.json
│    └─── testdb2
```

```javascript
//get reference to an existing collection or create a new one if the collection doesn't exist
const collection = connection.collection('testCollection');
    
//use collection the reference to peform operations on the collection

//insert documents into the collection. If an id isn't provided a random one will be generated.
collection.insertOne({ _id: cjld2cjxh0000qzrmn831i7rn, foo: 1, bar: false });
collection.inserMany([
    {
        foo: 2,
        bar: true
    },
    {
        foo: 3,
        bar: false
    },
    {
        foo: 4,
        bar: true
    },
]);

//retrieve all documents in the collection
collection.find();

//retrieve a single document by Id
collection.findById('cjld2cjxh0000qzrmn831i7rn');

//remove a single document by Id
collection.removeById('cjld2cjxh0000qzrmn831i7rn');

//remove all documents that match filter
collection.remove({bar: false});

//get number of documents in the collection
collection.count();

//remove collection from database
connection.dropCollection('testCollection');
```

## Filter
Filter documents using mongodb like query operators
```javascript

//find all documents that match filter
collection.find({ foo: {$gt: 2} });

//find first document that matches filter
collection.findOne({ foo: {$gt: 2} })

//filter documents using logical operators
collection.find(
    {
        $or: [
            { foo: {$lt: 2} },
            { bar: true }
        ]
    }
)

const collection.find({
            $and: [
                { bar: true },
                { $or: [{ foo: 1}, {foo: {$ne: 4}, bar: {$exists: true}} ]}
            ],
        });
        
        
//remove all documents that match filter
collection.remove({bar: true});

//remove first document that matches filter
collection.removeOne({bar: false});
```

## Update
Update documents using mongodb like update operators

```javascript
//update all documents that matches filter
collection.update({foo: {$gt: 2} }, {$set : {bar : false } });

//update first document that matches filter
collection.updateOne({foo: {$lt: 2} }, {$set : {bar : true } });

//update document by Id
collection.updateById('cjld2cjxh0000qzrmn831i7rn', {$set : {foo : 100 } });

//upsert document by adding setting upsert property to true on update filter
collection.updateOne({foo: {$gt: 1000} }, {$set : {bar : true }, upsert: true });

```

## Contact
Created by [Matt Ellis](https://github.com/mattellis91) - feel free to contact me!


## License 
This project is open source and available under the [MIT License](https://opensource.org/licenses/MIT). 
