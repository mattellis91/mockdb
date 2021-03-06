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
        expect(updateResult.data.length).to.equal(1);
        expect(collection.count()).to.equal(c1 + 1);
    })

    it('should successfully replace an existing document by id', () => {
        const insertResult = collection.insertOne({prop1:100, prop2:'aaa'});
        const replaceResult = collection.replaceById(insertResult.data[0]._id as string, {prop5: null}, true);
        expect(replaceResult.data.length).to.equal(1);

        let prevCount = collection.count();
        const replaceResult2 = collection.replaceById(cuid(), {prop5:true}, true);
        expect(collection.count()).to.equal(prevCount + 1);

        prevCount = collection.count();
        const replaceResult3 = collection.replaceById(cuid(), {prop6:true}, false);
        expect(collection.count()).to.equal(prevCount);        
    });

    it('should successfully replace one document that meets a given filter requirements', () => {
        const replaceResult = collection.replaceOne({prop5: {$exists:true}},{prop10:-1},true);
        expect(replaceResult.data.length).to.equal(1);

        let prevCount = collection.count();
        const replaceResult2 = collection.replaceOne({prop20: {$exists:true}},{prop10:2},true);
        expect(collection.count()).to.equal(prevCount + 1);
        
        prevCount = collection.count();
        const replaceResult3 = collection.replaceOne({prop20: {$exists:true}}, {prop10:100}, false);
        expect(collection.count()).to.equal(prevCount);  
    })

    it('should successfully replace multiple documents that meets a given filter requirements', () => {
        
        const replaceResult = collection.replace({prop10: {$exists:true}}, {prop30:'aaaa'},true);
        expect(replaceResult.data.length).to.equal(2);

        let prevCount = collection.count();
        const replaceResult2 = collection.replaceOne({prop10: {$exists:true}},{prop20:null},true);
        expect(collection.count()).to.equal(prevCount + 1);
        
        prevCount = collection.count();
        const replaceResult3 = collection.replaceOne({prop10: {$exists:true}}, {prop10:100}, false);
        expect(collection.count()).to.equal(prevCount);  

    });

    it('should update a document using the $inc operation', () => {
        const insertRes = collection.insertOne({num1:1});
        const updateRes = collection.updateOne({_id: insertRes.data[0]._id},{$inc: {num1: 2, num2:2}});
        expect(updateRes.data.length).to.equal(1);
        expect(updateRes.data[0].num1).to.equal(3);
        expect(updateRes.data[0].num2).to.equal(2);
    })

    it('should update a document using the $mul operation', () => {
        const insertRes = collection.insertOne({num1:0.5, num2:10, num3:3});
        const updateRes = collection.updateOne({_id: insertRes.data[0]._id},{$mul: {num1: 2, num2:0.5, num3:3}});
        expect(updateRes.data.length).to.equal(1);
        expect(updateRes.data[0].num1).to.equal(1);
        expect(updateRes.data[0].num2).to.equal(5);
        expect(updateRes.data[0].num3).to.equal(9);
    })

    it('should update a document using the $min operation', () => {
        const insertRes = collection.insertOne({highScore:800, lowScore: 200});
        const updateRes = collection.updateOne({_id: insertRes.data[0]._id},{$min: {lowScore:150, highScore:950}});
        expect(updateRes.data.length).to.equal(1);
        expect(updateRes.data[0].lowScore).to.equal(150);
        expect(updateRes.data[0].highScore).to.equal(800);
    });

    it('should update a document using the $max operation', () => {
        const insertRes = collection.insertOne({highScore:800, lowScore: 200});
        const updateRes = collection.updateOne({_id: insertRes.data[0]._id},{$max: {lowScore:150, highScore:950}});
        expect(updateRes.data.length).to.equal(1);
        expect(updateRes.data[0].lowScore).to.equal(200);
        expect(updateRes.data[0].highScore).to.equal(950);        
    });

    it('should update a document using the $unset operation', () => {
        const insertRes = collection.insertOne({p1:1, p2:2, p3:3});
        const updateRes = collection.updateOne({_id: insertRes.data[0]._id},{$unset: {p2:"", p3:""}});
        expect(updateRes.data.length).to.equal(1);
        expect(Object.keys(updateRes.data[0]).length).to.equal(2);
        expect(updateRes.data[0].p1).to.exist;
        expect(updateRes.data[0].p2).to.not.exist;
        expect(updateRes.data[0].p3).to.not.exist;
    })

    it('should update a document using the $rename operation', () => {
        const insertRes = collection.insertOne({nmae:'Gon',age:12});
        const updateRes = collection.updateOne({_id: insertRes.data[0]._id},{$rename: {"nmae": "name"}});
        expect(updateRes.data.length).to.equal(1);
        expect(Object.keys(updateRes.data[0]).length).to.equal(3);
        expect(updateRes.data[0].nmae).to.not.exist;
        expect(updateRes.data[0].name).to.exist;
        expect(updateRes.data[0].name).to.equal('Gon');
    })

    it('should set additional properties on upsert using $setOnInsert operation', () => {
        const updateRes = collection.updateOne({_id: 'aaa'},{$set: {p1:1}, $setOnInsert: {p2:2}, upsert:true});
        expect(updateRes.data.length).to.equal(1);
        expect(updateRes.data[0].p1).to.exist;
        expect(updateRes.data[0].p2).to.exist;
        const updateRes2 = collection.updateOne({_id: updateRes.data[0]._id},{$set: {p3:3}, $setOnInsert: {p4:4}, upsert:true});
        expect(updateRes2.data.length).to.equal(1);
        expect(updateRes2.data[0].p3).to.exist;
        expect(updateRes2.data[0].p4).to.not.exist;
    });

    it('should update a document using the $addToset operation', () => {
        const insertRes = collection.insertOne({colors:['red','blue','green'], shapes:['square','triangle']});
        const updateRes = collection.updateOne({_id:insertRes.data[0]._id},{$addToSet: {colors: 'yellow', shapes: 'square'}});
        expect(updateRes.data.length).to.equal(1);
        expect((updateRes.data[0].colors as string[]).length).to.equal(4);
        expect((updateRes.data[0].shapes as string[]).length).to.equal(2);
    })

    it('should update a document using the $pop operation', () => {
        const insertRes = collection.insertOne({colors:['red','blue','green'], shapes:['square','triangle','circle']});
        const updateRes = collection.update({_id:insertRes.data[0]._id},{$pop:{colors:1, shapes:-1}});
        expect(updateRes.data.length).to.equal(1);
        expect((updateRes.data[0].colors as string[]).length).to.equal(2);
        expect((updateRes.data[0].colors as string[])[0] as string).to.equal('red');
        expect((updateRes.data[0].colors as string[])[1] as string).to.equal('blue');
        expect((updateRes.data[0].shapes as string[]).length).to.equal(2);
        expect((updateRes.data[0].shapes as string[])[0] as string).to.equal('triangle');
        expect((updateRes.data[0].shapes as string[])[1] as string).to.equal('circle');
    })

    it('should update a document using the $push operation', () => {
        const insertRes = collection.insertOne({colors:['red','blue','green'], shapes:['square','triange','circle']});
        const updateRes = collection.update({_id:insertRes.data[0]._id}, {$push:{colors: 'yellow', shapes:'rectangle' }});
        expect(updateRes.data.length).to.equal(1);
        expect((updateRes.data[0].colors as string[]).length).to.equal(4);
        expect((updateRes.data[0].shapes as string[]).length).to.equal(4);
        expect((updateRes.data[0].colors as string[])[3]).to.equal('yellow');
        expect((updateRes.data[0].shapes as string[])[3]).to.equal('rectangle');
    })

    it('should update a document using the $pullAll operation', () => {
        const insertRes = collection.insertOne({scores: [0,2,5,5,1,0]});
        const updateRes = collection.update({_id:insertRes.data[0]._id}, {$pullAll:{scores: [0,5]}});
        expect(updateRes.data.length).to.equal(1);
        expect((updateRes.data[0].scores as number[]).length).to.equal(2);
        expect((updateRes.data[0].scores as number[])[0]).to.equal(2);
        expect((updateRes.data[0].scores as number[])[1]).to.equal(1);
    })

});