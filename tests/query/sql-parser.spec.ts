import fs from 'fs';
import { expect } from "chai";
import { Db, MockDb, Responses, Table } from '../../src';
const fsPromises = fs.promises;

describe('sql query test', () => {
    let connection:Db;
    let table:Table;
    before(async () => {
        if(fs.existsSync('./mockdb/')){
            await fsPromises.rmdir('./mockdb/', {recursive: true});
        }
        await MockDb.createDb('querytest');
        connection = MockDb.connect('querytest');
        table = connection.table('queryTable');
    });
    
    after(async () => {
        if(fs.existsSync('./mockdb/')){
            await fsPromises.rmdir('./mockdb/', {recursive: true});
        }
    });

    it('should return records that match given query', () => {
        const res = table.insertMany([{
            prop1: 10,
            prop2: 'aaa'
        },
        {
            prop1: 20,
            prop2: 'asdasdasdsa'
        },
        {
            prop1: 50,
            prop2: 'vvv'
        }
        ]);
        // table.retrieveRecords("WHERE prop1 < 30 AND prop2 = 'aaa'");
        table.retrieveRecords("WHERE prop1 = 10")
        //table.retrieveRecords("WHERE prop1 < 30 AND prop2 = 'aaa' OR prop2 > 1");
    });
});