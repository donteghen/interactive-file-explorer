import { assert } from "chai";

describe('Test setup', function () {
    it('should pass', function () {
        const name = 'TEST'
        
        assert.typeOf(name, 'string');
    })
});
