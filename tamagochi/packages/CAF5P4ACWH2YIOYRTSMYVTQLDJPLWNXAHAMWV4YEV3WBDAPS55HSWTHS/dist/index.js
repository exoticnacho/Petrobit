import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
if (typeof window !== 'undefined') {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
}
export const networks = {
    testnet: {
        networkPassphrase: "Test SDF Network ; September 2015",
        contractId: "CAF5P4ACWH2YIOYRTSMYVTQLDJPLWNXAHAMWV4YEV3WBDAPS55HSWTHS",
    }
};
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAQAAAAAAAAAAAAAAA1BldAAAAAANAAAAAAAAAAthY2Nlc3NvcmllcwAAAAAEAAAAAAAAAAliaXJ0aGRhdGUAAAAAAAAGAAAAAAAAAAZlbmVyZ3kAAAAAAAQAAAAAAAAACWhhcHBpbmVzcwAAAAAAAAQAAAAAAAAABmh1bmdlcgAAAAAABAAAAAAAAAAIaXNfYWxpdmUAAAABAAAAAAAAAAxsYXN0X3VwZGF0ZWQAAAAGAAAAAAAAAAVsZXZlbAAAAAAAAAQAAAAAAAAABG5hbWUAAAAQAAAAAAAAAA1uZXh0X2xldmVsX3hwAAAAAAAABgAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAApzcGVjaWVzX2lkAAAAAAAEAAAAAAAAAAJ4cAAAAAAABg==",
            "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAgAAAAEAAAAAAAAAA1BldAAAAAABAAAAEwAAAAEAAAAAAAAABUNvaW5zAAAAAAAAAQAAABM=",
            "AAAAAAAAAAAAAAAGY3JlYXRlAAAAAAACAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAABG5hbWUAAAAQAAAAAQAAB9AAAAADUGV0AA==",
            "AAAAAAAAAAAAAAAHZ2V0X3BldAAAAAABAAAAAAAAAAVvd25lcgAAAAAAABMAAAABAAAH0AAAAANQZXQA",
            "AAAAAAAAAAAAAAAJZ2V0X2NvaW5zAAAAAAAAAQAAAAAAAAAFb3duZXIAAAAAAAATAAAAAQAAAAs=",
            "AAAAAAAAAAAAAAAEZmVlZAAAAAEAAAAAAAAABW93bmVyAAAAAAAAEwAAAAEAAAfQAAAAA1BldAA=",
            "AAAAAAAAAAAAAAAEcGxheQAAAAEAAAAAAAAABW93bmVyAAAAAAAAEwAAAAEAAAfQAAAAA1BldAA=",
            "AAAAAAAAAAAAAAAFc2xlZXAAAAAAAAABAAAAAAAAAAVvd25lcgAAAAAAABMAAAABAAAH0AAAAANQZXQA",
            "AAAAAAAAAAAAAAAEd29yawAAAAEAAAAAAAAABW93bmVyAAAAAAAAEwAAAAEAAAfQAAAAA1BldAA=",
            "AAAAAAAAAAAAAAAIZXhlcmNpc2UAAAABAAAAAAAAAAVvd25lcgAAAAAAABMAAAABAAAH0AAAAANQZXQA",
            "AAAAAAAAAAAAAAAMbWludF9nbGFzc2VzAAAAAQAAAAAAAAAFb3duZXIAAAAAAAATAAAAAQAAB9AAAAADUGV0AA==",
            "AAAAAAAAAAAAAAAMdXBkYXRlX2NvaW5zAAAAAgAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAABAAAACw=="]), options);
        this.options = options;
    }
    fromJSON = {
        create: (this.txFromJSON),
        get_pet: (this.txFromJSON),
        get_coins: (this.txFromJSON),
        feed: (this.txFromJSON),
        play: (this.txFromJSON),
        sleep: (this.txFromJSON),
        work: (this.txFromJSON),
        exercise: (this.txFromJSON),
        mint_glasses: (this.txFromJSON),
        update_coins: (this.txFromJSON)
    };
}
