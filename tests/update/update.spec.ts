import fs from 'fs';
import { expect } from "chai";
import { Db, MockDb, Responses, Collection } from '../../src';
import cuid from 'cuid';
const fsPromises = fs.promises;

describe('Update tests', () => {
    let connection:Db;
    let collection:Collection;
    before(async () => {
        if(fs.existsSync('./mockdb/')){
            await fsPromises.rmdir('./mockdb/', {recursive: true});
        }
        await MockDb.createDb('updatetest');
        connection = MockDb.connect('updatetest');
        collection = connection.collection('test-update-collection');
    });
    
    after(async () => {
        if(fs.existsSync('./mockdb/')){
            await fsPromises.rmdir('./mockdb/', {recursive: true});
        }
    });

    it('should successfully update an existing document', () => {
        const collectionInsertResult = collection.insertOne({
            prop1: 1,
            prop2: 2
        });
        const updateResultResponse = collection.updateById(collectionInsertResult.data[0]._id as string, {$set: {prop1:10}});
        expect(updateResultResponse.status).to.equal(Responses.SUCCESS);
        expect(updateResultResponse.data[0].prop1).to.equal(10);
    });

    it('should unsuccesfully update an existing document if not upserting', () => {
        const newId = cuid();
        const updateResultResponse = collection.updateById(newId, {$set: {prop1:10}});
        expect(updateResultResponse.status).to.equal(Responses.ERROR);
    });

    it('should successfully update an existing document if upserting', () => {
        const newId = cuid();
        const updateResultResponse = collection.updateById(newId, {$set: {prop1:'aaa'}, upsert:true});
        expect(updateResultResponse.status).to.equal(Responses.SUCCESS);
    });

});