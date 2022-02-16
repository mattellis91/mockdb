import { DB } from "../../src";
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
        const dbHandler = new DB();
        await dbHandler.createDb('aaa');
        expect(fs.existsSync('./mockdb/aaa')).to.be.true;
    });

    it('should remove an existing database', async () => {
        const dbHandler = new DB();
        await dbHandler.removeDb('aaa');
        expect(fs.existsSync('./mockdb/aaa')).to.be.false;
    });
});