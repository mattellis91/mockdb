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
        const collectionInsertResult = collection.insertMany([
            {
                prop1: 1,
                prop2: 'aa'
            },
            {
                prop1: 2,
                prop2: 'vv'
            },
            {
                prop1: 3,
                prop2: 'ffd'
            },
            {
                prop1: 4,
                prop2: 'vvv'
            }
        ]);
        const updateResultResponse = collection.updateById(collectionInsertResult.data[0]._id as string, {$set: {prop1:10}});
        expect(updateResultResponse.status).to.equal(Responses.SUCCESS);
        expect(updateResultResponse.data[0].prop1).to.equal(10);
    });

    it('should unsuccesfully update an existing document if not upserting by id', () => {
        const newId = cuid();
        const updateResultResponse = collection.updateById(newId, {$set: {prop1:10}});
        expect(updateResultResponse.status).to.equal(Responses.ERROR);
    });

    it('should successfully update / insert an existing document if upserting by id', () => {
        const newId = cuid();
        const updateResultResponse = collection.updateById(newId, {$set: {prop1:3, prop2:'bb'}, upsert:true});
        expect(updateResultResponse.status).to.equal(Responses.SUCCESS);
        const c1 = collection.count();
        const newUpdateResultResponse = collection.updateById(newId, {$set: {prop1:5}, upsert:true});
        expect(collection.count()).to.equal(c1);
    });

    it('should sucessfully update / insert one document that meets the given filter requirements', () => {
        const updateOneResult = collection.updateOne({prop1: {$gte: 10}}, { $set: {prop2: 'greater than equal to 10'}});
        expect(updateOneResult.status).to.equal(Responses.SUCCESS);
        expect(updateOneResult.data[0].prop2).to.equal('greater than equal to 10');
        const c1 = collection.count();
        const newUpdateResultResponse = collection.updateOne({prop1: {$gt: 10}}, { $set: {prop1: 11, prop2: 'greater than 10'}, upsert: true});
        expect(collection.count()).to.equal(c1 + 1);
    });

    it('should successfully update multiple documents that meet the given filter requirements', () => {
       const updateRequest = collection.update({prop1: {$lt: 10}}, { $set: {prop2: 'less than 10'}});
       expect(updateRequest.status).to.equal(Responses.SUCCESS);
       expect(updateRequest.data.length).to.equal(4); 
       expect(updateRequest.data[0].prop2).to.equal('less than 10');
       expect(updateRequest.data[1].prop2).to.equal('less than 10');
       expect(updateRequest.data[2].prop2).to.equal('less than 10');
       expect(updateRequest.data[3].prop2).to.equal('less than 10');
    });

    it('should unsuccessfully update documents that dont meet the filter requirements', () => {
        const c1 = collection.count();
        const updateResult = collection.update({prop1: {$lt: 1}}, {$set: {prop2: 'less than 1'}, upsert: true});
        expect(updateResult.data.length).to.equal(0);
        expect(collection.count()).to.equal(c1);
    })

});