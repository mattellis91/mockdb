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

    
    it('should successfully connect to an existing db', () => {
        const connection = MockDb.connect('dbtest');
        expect(connection.successfullyConnected).to.be.true;
    });

    it('should unsuccessful connect to a non existent db', () => {
        const connection = MockDb.connect('nodb');
        expect(connection.successfullyConnected).to.be.false;
    });

    it('should remove an existing database', async () => {
        await MockDb.removeDb('dbtest');
        expect(fs.existsSync('./mockdb/dbtest')).to.be.false;
    });

});