import { generateClaimTypes, ClaimType } from '../../src/schema-registry';
import chai from './helpers/chai';
const { expect } = chai;

describe('generateClaimTypes', () => {
    it('should generate an array of ClaimType from a schema string', () => {
        const schema = 'bytes32 proposalId, bool vote';
        const expected: ClaimType[] = [
            { key: '0x70726f706f73616c496400000000000000000000000000000000000000000000', dataType: '0x6279746573333200000000000000000000000000000000000000000000000000' },
            { key: '0x766f746500000000000000000000000000000000000000000000000000000000', dataType: '0x626f6f6c00000000000000000000000000000000000000000000000000000000' },
        ];

        const result = generateClaimTypes(schema);

        console.log(`${JSON.stringify(result)}`);

        expect(JSON.stringify(result)).eq(JSON.stringify(expected));
    });

    it('should throw an error if key or dataType is not valid', () => {
        const schema = '';
        expect(() => generateClaimTypes(schema)).throw('Schema is required');
    });
});