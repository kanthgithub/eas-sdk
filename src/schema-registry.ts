import  { SchemaRegistry as SchemaRegistryContract } from './types/SchemaRegistry';
import { SchemaRegistry__factory } from './types/SchemaRegistry__factory';
import { Overrides, TransactionReceipt } from 'ethers';
import { legacyVersion } from './legacy/version';
import { Base, Transaction, TransactionSigner } from './transaction';
import { getSchemaUID, ZERO_ADDRESS, ZERO_BYTES32 } from './utils';
import { ethers } from 'ethers';

export declare type SchemaRecord = {
  uid: string;
  resolver: string;
  revocable: boolean;
  schema: string;
};

export declare type ClaimType = {
  key: string;
  dataType: string;
}

export interface RegisterSchemaParams {
  schema: string;
  resolverAddress?: string;
  revocable?: boolean;
}

export interface GetSchemaParams {
  uid: string;
}

export interface SchemaRegistryOptions {
  signer?: TransactionSigner;
}

export const generateClaimTypes = (schema: string): ClaimType[] => {

  if(!schema) {
    throw new Error('Schema is required');
  }

  //check if the schema has balanced string i.e it should have key and datatype in each set where set is separated by comma
  if(schema.split(',').length % 2 !== 0) {
    throw new Error('Schema is not balanced');
  }

  return schema.split(',').map(item => {
    const [dataType, key] = item.trim().split(' ');

    //validate for non null, non empty key and datatype
    if(!key || !dataType) {
      throw new Error('Key and dataType are required');
    }

    const bytes32Key = ethers.encodeBytes32String(key);
    const bytes32DataType = ethers.encodeBytes32String(dataType);

    if (bytes32Key.length !== 66 || bytes32DataType.length !== 66) {
      throw new Error('Key and dataType must be exactly 32 bytes when encoded');
    }

    return { key: bytes32Key, dataType: bytes32DataType };
  });
};

export class SchemaRegistry extends Base<SchemaRegistryContract> {
  constructor(address: string, options?: SchemaRegistryOptions) {
    const { signer } = options || {};

    super(new SchemaRegistry__factory(), address, signer);
  }

  // Returns the version of the contract
  public async getVersion(): Promise<string> {
    return (await legacyVersion(this.contract)) ?? this.contract.version();
  }

  // Registers a new schema and returns its UID
  public async register(
    { schema, resolverAddress = ZERO_ADDRESS, revocable = true }: RegisterSchemaParams,
    overrides?: Overrides
  ): Promise<Transaction<string>> {
    if (!this.signer) {
      throw new Error('Invalid signer');
    }

    if (!schema) {
      throw new Error('Schema is required');
    }

    const claimTypes: ClaimType[] = generateClaimTypes(schema);

    return new Transaction(
      await this.contract.register.populateTransaction(schema, claimTypes, resolverAddress, revocable, overrides ?? {}),
      this.signer,
      // eslint-disable-next-line require-await
      async (_receipt: TransactionReceipt) => getSchemaUID(schema, resolverAddress, revocable)
    );
  }

  // Returns an existing schema by a schema UID
  public async getSchema({ uid }: GetSchemaParams): Promise<SchemaRecord> {
    const schema = await this.contract.getSchema(uid);
    if (schema.uid === ZERO_BYTES32) {
      throw new Error('Schema not found');
    }

    return schema;
  }
}
