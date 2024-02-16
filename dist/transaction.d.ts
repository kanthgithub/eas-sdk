import { Addressable, BaseContract, ContractFactory, TransactionReceipt, TransactionRequest, TransactionResponse } from 'ethers';
export interface Signer extends Addressable {
    estimateGas?: (tx: TransactionRequest) => Promise<bigint>;
    call?: (tx: TransactionRequest) => Promise<string>;
    resolveName?: (name: string) => Promise<null | string>;
    sendTransaction?: (tx: TransactionRequest) => Promise<TransactionResponse>;
}
export declare class Transaction<T> {
    readonly tx: TransactionResponse;
    private readonly waitCallback;
    constructor(tx: TransactionResponse, waitCallback: (receipt: TransactionReceipt) => Promise<T>);
    wait(confirmations?: number): Promise<T>;
}
export declare class Base<C extends BaseContract> {
    contract: C;
    constructor(factory: ContractFactory, address: string, signer?: Signer);
    connect(signer: Signer): this;
    getChainId(): Promise<bigint>;
}
