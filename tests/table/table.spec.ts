import fs from 'fs';
import { expect } from "chai";
import { Db, MockDb } from '../../src';
const fsPromises = fs.promises;

describe('Table tests', () => {
    let connection:Db;
    before(async () => {
        if(fs.existsSync('./mockdb')){
            await fsPromises.rmdir('./mockdb', {recursive: true});
        }
        await MockDb.createDb('tabletest');
        connection = MockDb.connect('tabletest');
    });

    it('should create a new table', () => {
        const table = connection.table('test-table');
        console.log(table);
    });
});