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

    
    it('should return all table names in database', () => {
        connection.table('test-table-2');
        const tableNames = connection.listTables().sort();
        expect(tableNames.length).to.equal(2);
        expect(tableNames[0]).to.equal('test-table');
        expect(tableNames[1]).to.equal('test-table-2');
    });

    it('should remove an existing table', () => {
        const dropTableResult = connection.dropTable('test-table');
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