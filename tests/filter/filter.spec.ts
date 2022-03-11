import fs from 'fs';
import { expect } from "chai";
import { Db, MockDb, Responses, Collection } from '../../src';
const fsPromises = fs.promises;

describe('filter Tests', () => {
    let connection:Db;
    let collection:Collection;
    before(async () => {
        if(fs.existsSync('./mockdb/')){
            await fsPromises.rmdir('./mockdb/', {recursive: true});
        }
        await MockDb.createDb('filtertest');
        connection = MockDb.connect('filtertest');
    });
    
    after(async () => {
        if(fs.existsSync('./mockdb/')){
            await fsPromises.rmdir('./mockdb/', {recursive: true});
        }
    });

    it('should return all documents that meet the given filter requirements using only literal values', () => {
        collection = connection.collection('filter-test-collection')
        const collectionInsertResult = collection.insertMany([
            {
                prop1: 10,
                prop2: 'aaa'
            },
            {
                prop1: 20,
                prop2: 'aba'
            },
            {
                prop1: 30,
                prop2: 'aaa'
            },
            {
                prop1: 10,
                prop2: 'aaa'
            },
        ]);
        const findResponse = collection.find({prop1:10, prop2:'aaa'});
        expect(findResponse.data.length).to.equal(2);
        expect(findResponse.data[0].prop1).to.equal(10);
        expect(findResponse.data[0].prop2).to.equal('aaa');
        expect(findResponse.data[1].prop1).to.equal(10);
        expect(findResponse.data[1].prop2).to.equal('aaa');
    })

    it('should return the first document that meets the given requirements using only literal values', () => {
        const findOneResponse = collection.findOne({prop1:10, prop2:'aaa'});
        expect(findOneResponse.data.length).to.equal(1);
        expect(findOneResponse.data[0].prop1).to.equal(10);
        expect(findOneResponse.data[0].prop2).to.equal('aaa');
    });

    it('should return all documents that meet the given filter requirements using $eq filter operator', () => {
        const findResponse = collection.find({prop1:10, prop2:{$eq: 'aaa'}})
        expect(findResponse.data.length).to.equal(2);
        expect(findResponse.data[0].prop1).to.equal(10);
        expect(findResponse.data[0].prop2).to.equal('aaa');
        expect(findResponse.data[1].prop1).to.equal(10);
        expect(findResponse.data[1].prop2).to.equal('aaa');
    });

    it('should return all documents that meet the given filter requirements using $ne filter operator', () => {
        const findResponse = collection.find({prop1: {$ne: 10}});
        expect(findResponse.data.length).to.equal(2);
    });

    it('should return all documents that meet the given filter requirements using $gt filter operator', () => {
        const findResponse = collection.find({prop1: {$gt: 20}});
        expect(findResponse.data.length).to.equal(1);
    });

    it('should return all documents that meet the given filter requirements using $gte filter operator', () => {
        const findResponse = collection.find({prop1: {$gte: 20}});
        expect(findResponse.data.length).to.equal(2);
    });

    it('should return all documents that meet the given filter requirements using $lt filter operator', () => {
        const findResponse = collection.find({prop1: {$lt: 20}});
        expect(findResponse.data.length).to.equal(2);
    });

    it('should return all documents that meet the given filter requirements using $lte filter operator', () => {
        const findResponse = collection.find({prop1: {$lte: 20}});
        expect(findResponse.data.length).to.equal(3);
    });

    it('should return all documents that meet the given filter requirements using $in filter operator', () => {
        const findResponse = collection.find({prop1: {$in: [10,20] }});
        expect(findResponse.data.length).equal(3);
    })

    it('should return all documents that meet the given filter requirements using $nin filter operator', () => {
        const findResponse = collection.find({prop1: {$nin: [10,20] }});
        expect(findResponse.data.length).equal(1);
    })
})