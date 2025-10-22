import { Buffer } from "buffer";
import { Address } from '@stellar/stellar-sdk';
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from '@stellar/stellar-sdk/contract';
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Typepoint,
  Duration,
} from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk'
export * as contract from '@stellar/stellar-sdk/contract'
export * as rpc from '@stellar/stellar-sdk/rpc'

if (typeof window !== 'undefined') {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CBP7BPKMDBW3MV6WC3JRASAWDY3OXJJ7G4WPWIMFOHV7KSDMJ7GAS52U",
  }
} as const


export interface Pet {
  accessories: u32;
  birthdate: u64;
  energy: u32;
  happiness: u32;
  hunger: u32;
  is_alive: boolean;
  last_updated: u64;
  level: u32;
  name: string;
  next_level_xp: u64;
  owner: string;
  species_id: u32;
  xp: u64;
}

export type DataKey = {tag: "Pet", values: readonly [string]} | {tag: "Coins", values: readonly [string]};

export interface Client {
  /**
   * Construct and simulate a create transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create: ({owner, name}: {owner: string, name: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Pet>>

  /**
   * Construct and simulate a get_pet transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_pet: ({owner}: {owner: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Pet>>

  /**
   * Construct and simulate a get_coins transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_coins: ({owner}: {owner: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a feed transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  feed: ({owner}: {owner: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Pet>>

  /**
   * Construct and simulate a play transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  play: ({owner}: {owner: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Pet>>

  /**
   * Construct and simulate a sleep transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  sleep: ({owner}: {owner: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Pet>>

  /**
   * Construct and simulate a work transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  work: ({owner}: {owner: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Pet>>

  /**
   * Construct and simulate a exercise transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  exercise: ({owner}: {owner: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Pet>>

  /**
   * Construct and simulate a mint_glasses transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  mint_glasses: ({owner}: {owner: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Pet>>

  /**
   * Construct and simulate a update_coins transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  update_coins: ({owner, amount}: {owner: string, amount: i128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<i128>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAQAAAAAAAAAAAAAAA1BldAAAAAANAAAAAAAAAAthY2Nlc3NvcmllcwAAAAAEAAAAAAAAAAliaXJ0aGRhdGUAAAAAAAAGAAAAAAAAAAZlbmVyZ3kAAAAAAAQAAAAAAAAACWhhcHBpbmVzcwAAAAAAAAQAAAAAAAAABmh1bmdlcgAAAAAABAAAAAAAAAAIaXNfYWxpdmUAAAABAAAAAAAAAAxsYXN0X3VwZGF0ZWQAAAAGAAAAAAAAAAVsZXZlbAAAAAAAAAQAAAAAAAAABG5hbWUAAAAQAAAAAAAAAA1uZXh0X2xldmVsX3hwAAAAAAAABgAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAApzcGVjaWVzX2lkAAAAAAAEAAAAAAAAAAJ4cAAAAAAABg==",
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
        "AAAAAAAAAAAAAAAMdXBkYXRlX2NvaW5zAAAAAgAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAABAAAACw==" ]),
      options
    )
  }
  public readonly fromJSON = {
    create: this.txFromJSON<Pet>,
        get_pet: this.txFromJSON<Pet>,
        get_coins: this.txFromJSON<i128>,
        feed: this.txFromJSON<Pet>,
        play: this.txFromJSON<Pet>,
        sleep: this.txFromJSON<Pet>,
        work: this.txFromJSON<Pet>,
        exercise: this.txFromJSON<Pet>,
        mint_glasses: this.txFromJSON<Pet>,
        update_coins: this.txFromJSON<i128>
  }
}