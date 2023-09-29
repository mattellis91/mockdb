# Mockdb
Create and manage mock document orientated databases using mongodb like filters.

## Install
```javascript
npm i @mattellis91/mockdb
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
import { MockDb } from '@mattellis91/mockdb';

//connect to an existing database. If the database does not exist. 
//It will be created and a connection to it will be returned
const connection = MockDb.connect('testDb');

//create new db without connecting
//const connection = MockDb.createDb('testDb');

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

#### Current supported filter operators

| Operator      | Description   |
| ------------- |-------------  |
| [$eq](https://www.mongodb.com/docs/manual/reference/operator/query/eq/#mongodb-query-op.-eq)  | Matches values that are equal to a specified value.|
| [$ne](https://www.mongodb.com/docs/manual/reference/operator/query/ne/#mongodb-query-op.-ne)      | Matches all values that are not equal to a specified value.      |
| [$gt](https://www.mongodb.com/docs/manual/reference/operator/query/gt/#mongodb-query-op.-gt) | Matches values that are greater than a specified value.      |
| [$gte](https://www.mongodb.com/docs/manual/reference/operator/query/gte/#mongodb-query-op.-gte) | Matches values that are greater than or equal to a specified value.      |
| [$lt](https://www.mongodb.com/docs/manual/reference/operator/query/lt/#mongodb-query-op.-lt) |Matches values that are less than a specified value.    |
| [$lte](https://www.mongodb.com/docs/manual/reference/operator/query/lte/#mongodb-query-op.-lte) | Matches values that are less than or equal to a specified value.      |
| [$lte](https://www.mongodb.com/docs/manual/reference/operator/query/lte/#mongodb-query-op.-lte) | Matches values that are less than or equal to a specified value.      |
| [$in](https://www.mongodb.com/docs/manual/reference/operator/query/in/#mongodb-query-op.-in) | Matches any of the values specified in an array.   |
| [$nin](https://www.mongodb.com/docs/manual/reference/operator/query/nin/#mongodb-query-op.-nin) | Matches none of the values specified in an array.   |
| [$exists](https://www.mongodb.com/docs/manual/reference/operator/query/exists/#mongodb-query-op.-exists) | Matches documents that have the specified field. |
| [$text](https://www.mongodb.com/docs/manual/reference/operator/query/text/#mongodb-query-op.-text) | Performs text search. |
| [$and](https://www.mongodb.com/docs/manual/reference/operator/query/and/#mongodb-query-op.-and) |Joins query clauses with a logical AND returns all documents that match the conditions of both clauses. |
| [$or](https://www.mongodb.com/docs/manual/reference/operator/query/or/#mongodb-query-op.-or) | Joins query clauses with a logical OR returns all documents that match the conditions of either clause. |

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

#### Current supported update operators

| Operator      | Description   |
| ------------- |-------------  |
|[$set](https://www.mongodb.com/docs/manual/reference/operator/update/set/#mongodb-update-up.-set)  | Sets the value of a field in a document.|
| [$inc](https://www.mongodb.com/docs/manual/reference/operator/update/inc/#mongodb-update-up.-inc)      | Increments the value of the field by the specified amount.      |
| [$mul](https://www.mongodb.com/docs/manual/reference/operator/update/mul/#mongodb-update-up.-mul) | Multiplies the value of the field by the specified amount.      |
| [$min](https://www.mongodb.com/docs/manual/reference/operator/update/min/#mongodb-update-up.-min) | 	Only updates the field if the specified value is less than the existing field value.      |
| [$max](https://www.mongodb.com/docs/manual/reference/operator/update/max/#mongodb-update-up.-max) |	Only updates the field if the specified value is greater than the existing field value.  |
| [$unset](https://www.mongodb.com/docs/manual/reference/operator/update/unset/#mongodb-update-up.-unset) |     Removes the specified field from a document. |
| [$rename](https://www.mongodb.com/docs/manual/reference/operator/update/rename/#mongodb-update-up.-rename) |     Renames a field. |
| [$setOnInsert](https://www.mongodb.com/docs/manual/reference/operator/update/setOnInsert/#mongodb-update-up.-setOnInsert) |  Sets the value of a field if an update results in an insert of a document. Has no effect on update operations that modify existing documents. |
| [$addToset](https://www.mongodb.com/docs/manual/reference/operator/update/addToSet/#mongodb-update-up.-addToSet) |  Adds elements to an array only if they do not already exist in the set. |
| [$pop](https://www.mongodb.com/docs/manual/reference/operator/update/pop/#mongodb-update-up.-pop) |  Removes the first or last item of an array. |
| [$push](https://www.mongodb.com/docs/manual/reference/operator/update/push/#mongodb-update-up.-push) |  Adds an item to an array. |
| [$pullAll](https://www.mongodb.com/docs/manual/reference/operator/update/pullAll/#mongodb-update-up.-pullAll) | Removes all matching values from an array. |


## Roadmap

- Add exporting / importing data from databases 
- Add additional filter operators
- Add add update operators
- Add random data generation

## Tests

```javascript
npm run test
```

## Contact
Created by [Matt Ellis](https://github.com/mattellis91). Feel free to contact me

## License 
This project is open source and available under the [MIT License](https://opensource.org/licenses/MIT). 
