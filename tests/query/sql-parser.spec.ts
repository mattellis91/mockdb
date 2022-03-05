import {Parser} from 'node-sql-parser';
describe('sql parser test', () => {
    it('should build sql ast', () => {
        const p = new Parser();
        const sql = "SELECT * from Cats WHERE name='cat'"
        console.log(p.astify(sql));
    });
});