import fs from 'fs';
import { expect } from "chai";
import { Db, MockDb, Responses, Table } from '../../src';
const fsPromises = fs.promises;

describe('Table tests', () => {
    let connection:Db;
    let table:Table;
    before(async () => {
        if(fs.existsSync('./mockdb')){
            await fsPromises.rmdir('./mockdb', {recursive: true});
        }
        await MockDb.createDb('tabletest');
        connection = MockDb.connect('tabletest');
    });
    
    after(async () => {
        if(fs.existsSync('./mockdb')){
            await fsPromises.rmdir('./mockdb', {recursive: true});
        }
    });

    it('should create a new table', () => {
        table = connection.table('test-table');
        expect(table instanceof Table).to.be.true;
    });

    it('should sucessfully insert a new record into an existing table', () => {
        const tableInsertResult = table.insertOne({
            prop1: 'value1',
            prop2: 'value2'
        });
        expect(tableInsertResult.status).to.equal(Responses.SUCCESS);
    });

    it('should sucessfully retrieve a record from a table when supplying a valid id', () => {
        const tableInsertResult = table.insertOne({
            prop1: 'value10',
            prop2: 'value20'
        });
        const retrievedRecordResponse = table.retrieveRecordById(tableInsertResult.data[0]._id as string);
        expect(retrievedRecordResponse.status).to.equal(Responses.SUCCESS);      
        expect(retrievedRecordResponse.data.length).to.equal(1);  
    });

    it('should unsucessfully retrieve a record from a table when supplying an invalid id', () => {
        const retrievedRecordResponse = table.retrieveRecordById('aaa');
        expect(retrievedRecordResponse.status).to.equal(Responses.ERROR);
    });

    it('should successfully remove a record from a table when supplying a valid id', () => {
        const tableInsertResult = table.insertOne({
            prop1: 'value234',
            prop2: 'value342'
        });
        const removeResultResponse = table.removeRecord(tableInsertResult.data[0]._id as string);
        expect(removeResultResponse.status).to.equal(Responses.SUCCESS);
    });

    it('should unsucessfully remove a record from a table when supplying an invalid id', () => {
        const removeResultResponse = table.removeRecord('aaa');
        expect(removeResultResponse.status).to.equal(Responses.ERROR);
    });

    
    it('should successfully update an existing record', () => {
        const tableInsertResult = table.insertOne({
            prop1: 1,
            prop2: 2
        });
        const updateResultResponse = table.updateRecordById(tableInsertResult.data[0]._id as string, {prop1:10});
        expect(updateResultResponse.status).to.equal(Responses.SUCCESS);
        expect(updateResultResponse.data[0].prop1).to.equal(10);
    });

    it('should return all table names in database', () => {
        connection.table('test-table-2');
        const tableNames = connection.listTables().sort();
        expect(tableNames.length).to.equal(2);
        expect(tableNames[0]).to.equal('test-table');
        expect(tableNames[1]).to.equal('test-table-2');
    });

    it('should successfully return the number of records in a table', () => {
        expect(table.count()).to.equal(3);
    });

    it('should successfully rename the name of the table', () => {
        const renameResult = table.rename('test-table-renamed');
        const newTableConnection = connection.table('test-table-renamed');  
        expect(renameResult).to.be.true;
        expect(newTableConnection.count()).to.equal(3);
        expect(connection.listTables().length).to.equal(2);
    });

    it('should sucessfully insert many records into a table', () => {
        const insertManyResponse = table.insertMany([{
            prop1: 4,
            prop2: 43
        },{
            prop1: 10,
            prop2: 3434
        }
        ]);
        expect(insertManyResponse.status).to.equal(Responses.SUCCESS);
        expect(table.count()).to.equal(5);
    });

    it('should remove an existing table', () => {
        const dropTableResult = connection.dropTable('test-table-renamed');
        expect(dropTableResult).to.be.true;
    });

    it('should unsucessfully insert a new record into a deleted table', () => {
        const tableInsertResult = table.insertOne({
            prop1: 'value1',
            prop2: 'value2'
        });
        expect(tableInsertResult.status).to.equal(Responses.ERROR);
    });

});