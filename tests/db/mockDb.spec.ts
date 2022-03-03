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
        await MockDb.createDb('dbtest');
        expect(fs.existsSync('./mockdb/dbtest')).to.be.true;
    });


    it('should remove an existing database', async () => {
        await MockDb.removeDb('dbtest');
        expect(fs.existsSync('./mockdb/dbtest')).to.be.false;
    });

});