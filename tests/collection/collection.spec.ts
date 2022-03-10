import fs from 'fs';
import { expect } from "chai";
import { Db, MockDb, Responses, Collection } from '../../src';
const fsPromises = fs.promises;

describe('Collection tests', () => {
    let connection:Db;
    let collection:Collection;
    before(async () => {
        if(fs.existsSync('./mockdb/')){
            await fsPromises.rmdir('./mockdb/', {recursive: true});
        }
        await MockDb.createDb('collectiontest');
        connection = MockDb.connect('collectiontest');
    });
    
    after(async () => {
        if(fs.existsSync('./mockdb/')){
            await fsPromises.rmdir('./mockdb/', {recursive: true});
        }
    });

    it('should create a new collection', () => {
        collection = connection.collection('test-collection');
        expect(collection instanceof Collection).to.be.true;
    });

    it('should sucessfully insert a new document into an existing collection', () => {
        const collectionInsertResult = collection.insertOne({
            prop1: 'value1',
            prop2: 'value2'
        });
        expect(collectionInsertResult.status).to.equal(Responses.SUCCESS);
    });

    it('should sucessfully retrieve a document from a collection when supplying a valid id', () => {
        const collectionInsertResult = collection.insertOne({
            prop1: 'value10',
            prop2: 'value20'
        });
        const retrieveddocumentResponse = collection.findById(collectionInsertResult.data[0]._id as string);
        expect(retrieveddocumentResponse.status).to.equal(Responses.SUCCESS);      
        expect(retrieveddocumentResponse.data.length).to.equal(1);  
    });

    it('should unsucessfully retrieve a document from a collection when supplying an invalid id', () => {
        const retrieveddocumentResponse = collection.findById('aaa');
        expect(retrieveddocumentResponse.status).to.equal(Responses.ERROR);
    });

    it('should successfully update an existing document', () => {
        const collectionInsertResult = collection.insertOne({
            prop1: 1,
            prop2: 2
        });
        const updateResultResponse = collection.updateById(collectionInsertResult.data[0]._id as string, {prop1:10});
        expect(updateResultResponse.status).to.equal(Responses.SUCCESS);
        expect(updateResultResponse.data[0].prop1).to.equal(10);
    });

    it('should successfully retrieve all documents', () => {
        const alldocumentsRetrievalResponse = collection.find();
        expect(alldocumentsRetrievalResponse.status).to.equal(Responses.SUCCESS);
        expect(alldocumentsRetrievalResponse.data.length).to.equal(3);
    });

    it('should successfully remove a document from a collection when supplying a valid id', () => {
        const collectionInsertResult = collection.insertOne({
            prop1: 'value234',
            prop2: 'value342'
        });
        const removeResultResponse = collection.removeById(collectionInsertResult.data[0]._id as string);
        expect(removeResultResponse.status).to.equal(Responses.SUCCESS);
    });

    it('should unsucessfully remove a document from a collection when supplying an invalid id', () => {
        const removeResultResponse = collection.removeById('aaa');
        expect(removeResultResponse.status).to.equal(Responses.ERROR);
    });


    it('should return all collection names in database', () => {
        connection.collection('test-collection-2');
        const collectionNames = connection.listCollections().sort();
        expect(collectionNames.length).to.equal(2);
        expect(collectionNames[0]).to.equal('test-collection');
        expect(collectionNames[1]).to.equal('test-collection-2');
    });

    it('should successfully return the number of documents in a collection', () => {
        expect(collection.count()).to.equal(3);
    });

    it('should return all documents that meet the given filter requirements', () => {
        collection.find({prop1:10})
    })

    it('should successfully rename the name of the collection', () => {
        const renameResult = collection.rename('test-collection-renamed');
        const newcollectionConnection = connection.collection('test-collection-renamed');  
        expect(renameResult).to.be.true;
        expect(newcollectionConnection.count()).to.equal(3);
        expect(connection.listCollections().length).to.equal(2);
    });

    it('should sucessfully insert many documents into a collection', () => {
        const insertManyResponse = collection.insertMany([{
            prop1: 4,
            prop2: 43
        },{
            prop1: 10,
            prop2: 3434
        }
        ]);
        expect(insertManyResponse.status).to.equal(Responses.SUCCESS);
        expect(collection.count()).to.equal(5);
    });

    it('should remove an existing collection', () => {
        const dropcollectionResult = connection.dropCollection('test-collection-renamed');
        expect(dropcollectionResult).to.be.true;
    });

    it('should unsucessfully insert a new document into a deleted collection', () => {
        const collectionInsertResult = collection.insertOne({
            prop1: 'value1',
            prop2: 'value2'
        });
        expect(collectionInsertResult.status).to.equal(Responses.ERROR);
    });

});