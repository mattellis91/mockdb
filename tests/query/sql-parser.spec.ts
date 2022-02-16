import {Parser} from 'node-sql-parser';
describe('sql parser test', () => {
    it('should build sql ast', () => {
        const p = new Parser();
        const sql = 'UPDATE a SET id = 1 WHERE name IN (SELECT name FROM b)'
        console.log(p.astify(sql));
    });
});