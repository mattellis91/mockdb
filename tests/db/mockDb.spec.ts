import { MockDb } from "../../src";
import fs from 'fs';
import { expect } from "chai";
const fsPromises = fs.promises;

describe('Database tests', () => {

    before(async () => {
        if(fs.existsSync('./mockdb')){
            await fsPromises.rmdir('./mockdb', {recursive: true});
        }
    });

    it('should create a new database', async () => {
        await MockDb.createDb('aaa');
        expect(fs.existsSync('./mockdb/aaa')).to.be.true;
    });

    
    it('should create a connection to an existing db', () => {
        const connection = MockDb.connect('aaa');
        console.log(connection);
    });

    it('should remove an existing database', async () => {
        await MockDb.removeDb('aaa');
        expect(fs.existsSync('./mockdb/aaa')).to.be.false;
    });

});