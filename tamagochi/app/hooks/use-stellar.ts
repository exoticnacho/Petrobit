import { useCallback, useMemo } from "react";
import * as Tamago from "../../packages/CBP7BPKMDBW3MV6WC3JRASAWDY3OXJJ7G4WPWIMFOHV7KSDMJ7GAS52U";
import { useSubmitTransaction } from "./use-submit-transaction";
import { useWallet } from "./use-wallet";

// Definisikan tipe untuk Client Soroban yang diperbarui (dengan 'as any' untuk exercise)
interface CustomClient extends Tamago.Client {
  exercise: (args: { owner: string }) => Promise<any>;
  update_coins: (args: { owner: string, amount: number | bigint }) => Promise<any>; // ADDED: Update Coins
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  selectedWallet: unknown;
}

const NETWORK_PASSPHRASE = Tamago.networks.testnet.networkPassphrase;
const RPC_URL = "https://soroban-testnet.stellar.org";

export const useStellar = () => {
  const { address, isConnected } = useWallet();

  const { submit } = useSubmitTransaction({
    networkPassphrase: NETWORK_PASSPHRASE,
    rpcUrl: RPC_URL,
    onSuccess: () => {
      console.log("success submit tx"); 
    },
    onError: (error) => {
      console.error("Transaction error ", error);
    },
  });

  const getContractClient = useMemo(() => {
    if (!isConnected || address === "-") return null;

    // Menggunakan type assertion karena bindings lama tidak memiliki 'exercise'
    return new Tamago.Client({
      ...Tamago.networks.testnet,
      rpcUrl: "https://soroban-testnet.stellar.org",
      allowHttp: false,
      publicKey: address || undefined,
    }) as CustomClient;
  }, [address, isConnected]);

  // Helper for contract calls with transaction submission
  const execTx = useCallback(
    async (txPromise: Promise<any>) => {
      const tx = await txPromise;
      const submissionResult = await submit(tx);
      
      if (!submissionResult.success) {
          throw submissionResult.error || new Error("Stellar transaction failed during submission/polling.");
      }
      // Jika sukses, kembalikan hasilnya.
      return tx.result; 
    },
    [submit]
  );

  // Helper for read-only contract calls
  const readTx = useCallback(
    async (txPromise: Promise<any>, defaultValue: any, transform?: (result: any) => any) => {
      try {
        const tx = await txPromise;
        return transform ? transform(tx.result) : tx.result;
      } catch {
        return defaultValue;
      }
    },
    []
  );

  // Contract methods
  const createPet = (name: string) => {
    const tx = getContractClient!.create({ owner: address!, name });
    return execTx(tx);
  };

  /* --------------------------------- get_pet -------------------------------- */
  const getPet = () => {
    const tx = getContractClient!.get_pet({ owner: address! });
    return readTx(tx, null);
  };

  /* -------------------------------- get_coins ------------------------------- */
  const getCoins = () => {
    return readTx(getContractClient!.get_coins({ owner: address! }), 0, Number);
  };

  /* ---------------------------------- feed ---------------------------------- */
  const feedPet = () => {
    return execTx(getContractClient!.feed({ owner: address! }));
  };

  /* ---------------------------------- play ---------------------------------- */
  const playWithPet = () => {
    return execTx(getContractClient!.play({ owner: address! }));
  };

  /* ---------------------------------- work ---------------------------------- */
  const workWithPet = () => {
    return execTx(getContractClient!.work({ owner: address! }));
  };

  /* ---------------------------------- sleep --------------------------------- */
  const putPetToSleep = () => {
    return execTx(getContractClient!.sleep({ owner: address! }));
  };

  // Hook untuk aksi Exercise
  const exercisePet = () => {
    const tx = getContractClient!.exercise({ owner: address! });
    return execTx(tx);
  };

  /* ------------------------------ mint_glasses ------------------------------ */
  const mintGlasses = () => {
    return execTx(getContractClient!.mint_glasses({ owner: address! }));
  };

  // Hook untuk aksi Update Coins (Mint/Burn)
  const updateCoins = (amount: number | bigint) => {
    // Gunakan 'as any' karena typescript binding mungkin belum terupdate,
    // tapi kontrak sudah di-deploy dengan fungsi ini.
    const tx = (getContractClient!.update_coins as any)({ owner: address!, amount });
    return execTx(tx); 
  };

  return {
    createPet,
    getPet,
    getCoins,
    feedPet,
    playWithPet,
    workWithPet,
    putPetToSleep,
    exercisePet, 
    mintGlasses,
    updateCoins,
  };
};
