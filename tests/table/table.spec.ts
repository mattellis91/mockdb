import fs from 'fs';
import { expect } from "chai";
import { Db, MockDb, Table } from '../../src';
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
        expect(tableInsertResult.insertSuccessfull).to.be.true;
    });

    it('should sucessfully retrieve a record from a table when supplying a valid id', () => {
        const tableInsertResult = table.insertOne({
            prop1: 'value10',
            prop2: 'value20'
        });
        const retrievedRecord = table.retrieveRecordById(tableInsertResult.record._id as string);
        expect(retrievedRecord).to.not.be.undefined;        
    });

    it('should unsucessfully retrieve a record from a table when supplying an invalid id', () => {
        const retrievedRecord = table.retrieveRecordById('aaa');
        expect(retrievedRecord).to.be.undefined;
    });

    it('should successfully remove a record from a table when supplying a valid id', () => {
        const tableInsertResult = table.insertOne({
            prop1: 'value234',
            prop2: 'value342'
        });
        const removeResult = table.removeRecord(tableInsertResult.record._id as string);
        expect(removeResult).to.be.true;
    });

    it('should unsucessfully remove a record from a table when supplying an invalid id', () => {
        const removeResult = table.removeRecord('aaa');
        expect(removeResult).to.be.false;
    });

    
    it('should successfully update an existing record', () => {
        const tableInsertResult = table.insertOne({
            prop1: 1,
            prop2: 2
        });
        const updateResult = table.updateRecordById(tableInsertResult.record._id as string, {prop1:10});
        expect(updateResult).to.not.be.undefined;
        expect(updateResult?.prop1).to.equal(10);
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

    it('should remove an existing table', () => {
        const dropTableResult = connection.dropTable('test-table-renamed');
        expect(dropTableResult).to.be.true;
    });

    it('should unsucessfully insert a new record into a deleted table', () => {
        const tableInsertResult = table.insertOne({
            prop1: 'value1',
            prop2: 'value2'
        });
        expect(tableInsertResult.insertSuccessfull).to.be.false;
    });

});