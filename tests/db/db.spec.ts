import { DB } from "../../src";

describe('Database tests', () => {
    it('should create a new database', () => {
        const dbHandler = new DB();
        dbHandler.createDb('ff');
    });
});