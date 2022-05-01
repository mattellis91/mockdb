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

    it('should return all documents when passing in an empty filter', () => {
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
        const findResponse = collection.find({});
        expect(findResponse.data.length).to.equal(4);
    })

    it('should return all documents that meet the given filter requirements using only literal values', () => {
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

    it('should return all documents that meet the given filter requirements using $exists filter operator', () => {
        collection.insertMany([
            {
                prop3: 'sdfsdf'
            },
            {
                prop3: 'sdfs'
            },
        ]);
        const findResponse = collection.find({prop3: {$exists: false }});
        expect(findResponse.data.length).to.equal(4);
        const findResponse2 = collection.find({prop3: {$exists: true }});
        expect(findResponse2.data.length).to.equal(2);
    });

    
    it('should return all documents that meet the given filter requirements using $text filter operator', () => {
        collection.insertMany([
            {
                prop3: 'Coffee Shopping'
            },
            {
                prop3: 'coffee and cream'
            },
            {
                prop3: 'coffee'
            },
            {
                prop3: 'Baking a cake'
            },
            {
                prop3: 'baking'
            }
        ])
        const findResponse = collection.find({prop3: {$contains: {$terms:['coffee']}}});
        expect(findResponse.data.length).to.equal(3);
        const findResponse2 = collection.find({prop3: {$contains: {$terms:['coffee'], $caseSensitive:true}}});
        expect(findResponse2.data.length).to.equal(2);
        const findResponse3 = collection.find({prop3: {$contains: {$terms:['bake','coffee','cake']}}});
        expect(findResponse3.data.length).to.equal(4);
    })

    it('should remove the first document that meets the given filter requirements', () => {
        const prevLength = collection.count();
        const removeResponse = collection.removeOne({prop1: 10});
        expect(removeResponse.data.length).to.equal(1);
        expect(collection.count()).to.equal(prevLength - 1);
    });

    it('should remove all documents that meet the given filter requirements', () => {
        const prevLength = collection.count();
        const removeResponse = collection.remove({prop3: {$exists: true}});
        expect(removeResponse.data.length).to.equal(7);
        expect(collection.count()).to.equal(prevLength - 7);
    })

    it('should not remove any documents if no documents meet the filter requirements', () => {
        const prevLength = collection.count();
        const removeResponse = collection.remove({prop1: 200});
        expect(removeResponse.data.length).to.equal(0);
        expect(collection.count()).to.equal(prevLength);
    })

})