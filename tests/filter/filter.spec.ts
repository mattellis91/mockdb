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
})