import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useStellar } from "~/hooks/use-stellar";
import * as Tamago from "../../packages/CDZM6CDTSCJCHYXBJKO2YWGEPPLND7YTKVGANDUXVK7HRTBW4K67NAYL";
import { useWallet } from "~/hooks/use-wallet";
import { toast } from "sonner";
import type { GameState, PetStats, GameContextType } from "./game-context.type";

const GameContext = createContext<GameContextType | undefined>(undefined);

// INITIAL STATE (Diasumsikan sudah benar dan mencakup Level/XP/Species)
const INITIAL_STATE: GameState = {
  stats: {
    hunger: 100, happy: 100, energy: 100, level: 1, xp: 0, nextLevelXp: 200, speciesId: 0,
  },
  coins: 0, inventory: [], equippedItems: [], isSleeping: false,
  lastUpdate: Date.now(), petMood: "neutral", petName: undefined, hasRealPet: false,
};

// --- TIPE MOOD BARU ---
type MoodMultiplier = "boost" | "neutral" | "penalty";

// State lokal tambahan untuk menyimpan Mood Multiplier yang tidak ada di kontrak
interface MoodState {
    moodType: MoodMultiplier;
    message: string;
    lastMoodCheck: number;
}
const INITIAL_MOOD_STATE: MoodState = {
    moodType: "neutral",
    message: "A perfect day!",
    lastMoodCheck: Date.now(),
};
// -----------------------


export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isConnected } = useWallet();
  const { getPet, getCoins, createPet, feedPet: feedPetStellar, mintGlasses, playWithPet: playWithPetStellar, workWithPet: workWithPetStellar, putPetToSleep: putPetToSleepStellar, exercisePet: exercisePetStellar } = useStellar();

  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem("pixelPetGame");
    if (saved) {
      const parsed = JSON.parse(saved);
      // PENTING: Jika ada properti baru yang disimpan di localStorage, pastikan di-merge
      return { ...INITIAL_STATE, ...parsed, stats: { ...INITIAL_STATE.stats, ...parsed.stats } };
    }
    return INITIAL_STATE;
  });
  
  // NEW STATE: State lokal untuk Mood (tidak disimpan di kontrak)
  const [moodState, setMoodState] = useState<MoodState>(() => {
      const savedMood = localStorage.getItem("pixelPetMood");
      // Jika mood disimpan lebih dari 24 jam yang lalu, reset mood.
      if (savedMood) {
        const parsedMood = JSON.parse(savedMood);
        const hoursElapsed = (Date.now() - parsedMood.lastMoodCheck) / (1000 * 60 * 60);
        if (hoursElapsed < 24) return parsedMood; 
      }
      return INITIAL_MOOD_STATE;
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Simpan Mood State secara terpisah ke localStorage
  useEffect(() => {
    localStorage.setItem("pixelPetMood", JSON.stringify(moodState));
  }, [moodState]);

  // --- LOGIC MOOD ACAR HARIAN ---
  const rollNewMood = useCallback(() => {
    const moods: MoodState[] = [
        { moodType: "boost", message: "✨ Energetic Mood: +20% efficiency on Exercise!", lastMoodCheck: Date.now() },
        { moodType: "penalty", message: "🐌 Grumpy Mood: -50% coin gain from Work.", lastMoodCheck: Date.now() },
        { moodType: "neutral", message: "A peaceful day. All actions are normal.", lastMoodCheck: Date.now() },
    ];
    // Pilih mood secara acak
    const newMood = moods[Math.floor(Math.random() * moods.length)];
    setMoodState(newMood);
    toast.info(`Today's Mood: ${newMood.message}`, { duration: 8000 });
  }, []);

  // Effect untuk merolling mood setiap 24 jam atau pada startup
  useEffect(() => {
      const hoursElapsed = (Date.now() - moodState.lastMoodCheck) / (1000 * 60 * 60);
      if (hoursElapsed >= 24) {
          rollNewMood();
      }
  }, [moodState.lastMoodCheck, rollNewMood]);
  // --- END LOGIC MOOD ACAR HARIAN ---


  // Helper to convert blockchain Pet to our PetStats
  const convertPetToStats = useCallback((pet: Tamago.Pet): { stats: PetStats; petName: string } => {
    const stats: PetStats = {
        hunger: Number(pet.hunger), happy: Number(pet.happiness), energy: Number(pet.energy),
        level: Number((pet as any).level), 
        xp: Number((pet as any).xp), 
        nextLevelXp: Number((pet as any).next_level_xp), 
        speciesId: Number((pet as any).species_id),
    };
    return { stats, petName: pet.name };
  }, []);

  // Calculate pet mood (visual mood, beda dengan daily mood)
  const calculateMood = useCallback((stats: PetStats, isSleeping: boolean, isAlive: boolean): GameState["petMood"] => {
    if (!isAlive) return "sad"; 
    if (isSleeping) return "sleeping";
    
    if (stats.hunger < 20 || stats.happy < 20 || stats.energy < 20) return "sad";
    const avgStat = (stats.hunger + stats.happy + stats.energy) / 3;
    if (avgStat > 80) return "happy";
    
    return "neutral";
  }, []); 


  // Helper to validate pet action
  const validatePetAction = useCallback(() => {
    if (!isConnected || !gameState.hasRealPet || isLoading || gameState.stats.hunger <= 0 || gameState.stats.happy <= 0) {
        toast.error(isConnected ? (gameState.hasRealPet ? "Action in progress or Pet is unwell." : "Please create your pet on-chain first!") : "Please connect your wallet first!");
        return false;
    }
    return true;
  }, [isConnected, gameState.hasRealPet, isLoading, gameState.stats.hunger, gameState.stats.happy]);


  // Helper to execute Stellar actions
  const executeStellarAction = useCallback(async (
    action: () => Promise<Tamago.Pet>, 
    loadingMessage: string, 
    successMessage: string,
    moodType: "feed" | "play" | "work" | "sleep" | "exercise" | "mint" | "create"
  ) => {
    if (!validatePetAction()) return;

    setIsLoading(true);
    toast.loading(loadingMessage, { id: "stellar-tx" });

    try {
      const pet = await action();
      toast.dismiss("stellar-tx");
      
      const { stats: newStats, petName } = convertPetToStats(pet);
      const newCoins = await getCoins();

      setGameState(prev => {
        const equippedItems: string[] = [];
        if ((pet.accessories as any & 0b0001) > 0) { 
             equippedItems.push('cool-glasses');
        }

        const isLevelUp = newStats.level > prev.stats.level;
        
        return {
          ...prev,
          stats: newStats,
          coins: Number(newCoins),
          petName: petName,
          hasRealPet: pet.is_alive,
          petMood: calculateMood(newStats, moodType === 'sleep', pet.is_alive),
          equippedItems: equippedItems,
          inventory: equippedItems,
          lastUpdate: Date.now(),
        }
      });
      
      toast.success(successMessage);
      
      // Notifikasi Level Up
      if (newStats.level > gameState.stats.level) {
        toast.info(`⬆️ LEVEL UP! Pet reached Level ${newStats.level}!`, { duration: 5000 });
      }

    } catch (error) {
      toast.dismiss("stellar-tx");
      console.error("Stellar action failed:", error);
      toast.error("❌ Transaction failed! Check console for details.");
    } finally {
      setIsLoading(false);
    }
  }, [validatePetAction, getCoins, convertPetToStats, calculateMood, gameState.stats.level]);


  // Handlers untuk aksi pet
  const feedPet = () => executeStellarAction(feedPetStellar, "🍔 Pet is eating on Stellar...", "🍽️ Pet is full!", "feed");
  const playWithPet = () => executeStellarAction(playWithPetStellar, "⚽ Pet is playing on Stellar...", "😊 Pet is happy!", "play");
  const workWithPet = () => executeStellarAction(workWithPetStellar, "💼 Pet is working on Stellar...", "💰 Pet earned coins!", "work");
  const putPetToSleep = () => executeStellarAction(putPetToSleepStellar, "😴 Pet is sleeping on Stellar...", "💤 Pet is rested!", "sleep");
  const exercisePet = () => executeStellarAction(exercisePetStellar, "🏃 Pet is exercising on Stellar...", "💪 Pet feels stronger!", "exercise");


  // Sync with blockchain data
  const syncWithBlockchain = useCallback(async () => {
    if (!isConnected) return;
    
    setIsLoading(true);

    try {
        const pet = await getPet(); 
        const coins = await getCoins();
        
        if (pet && coins !== undefined) {
            const { stats: newStats, petName } = convertPetToStats(pet);
            
            const equippedItems: string[] = [];
            if ((pet.accessories as any & 0b0001) > 0) { 
                equippedItems.push('cool-glasses');
            }

            setGameState(prev => ({
                ...prev,
                stats: newStats,
                coins: Number(coins),
                equippedItems: equippedItems,
                inventory: equippedItems, 
                petMood: calculateMood(newStats, prev.petMood === 'sleeping', pet.is_alive),
                petName: petName,
                lastUpdate: Date.now(),
                hasRealPet: pet.is_alive,
            }));
            
            if (pet.is_alive) {
                toast.success("🔗 Synced with Stellar blockchain!");
                // Roll mood pada sync pertama atau jika mood belum di-roll hari ini
                const hoursElapsed = (Date.now() - moodState.lastMoodCheck) / (1000 * 60 * 60);
                if (hoursElapsed >= 24) rollNewMood();
            } else {
                toast.error("⚰️ Your pet passed away. Time to mourn.");
            }

        } else if (pet === null) {
            // Pet not found on chain
            setGameState(prev => ({ ...INITIAL_STATE, hasRealPet: false, petName: undefined }));
        }

    } catch (error) {
        console.error("Sync failed:", error);
        toast.error("⚠️ Failed to sync with blockchain. Connection error.");
    } finally {
        setIsLoading(false);
    }
  }, [isConnected, getPet, getCoins, convertPetToStats, calculateMood, moodState.lastMoodCheck, rollNewMood]); // Tambahkan dependensi moodState dan rollNewMood


  const createRealPet = async (name: string) => {
    if (!isConnected || isLoading) return;

    setIsLoading(true);
    toast.loading("🥚 Creating pet on Stellar...");

    try {
      const pet = await createPet(name);
      toast.dismiss();

      const { stats: newStats, petName } = convertPetToStats(pet);
      const coins = await getCoins();

      setGameState(prev => ({
        ...prev,
        stats: newStats,
        petName: petName,
        coins: Number(coins),
        hasRealPet: true,
        lastUpdate: Date.now(),
        petMood: calculateMood(newStats, false, true) 
      }));

      toast.success(`🎉 Your pet ${petName} is alive on-chain!`);
      rollNewMood(); // Roll mood setelah pet dibuat
      
    } catch (error) {
      toast.dismiss();
      console.error("Pet creation failed:", error);
      toast.error("❌ Pet creation failed! Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };


  const equipItem = (item: string) => {
    if (!validatePetAction()) return;

    setGameState((prev) => {
      if (prev.equippedItems.includes(item)) {
        toast.info("Item already equipped.");
        return prev;
      }
      if (!prev.inventory.includes(item)) {
        toast.error("Item not found in inventory. You must mint it first!");
        return prev;
      }

      toast.success(`✨ Equipped ${item}!`);
      return {
        ...prev,
        equippedItems: [...prev.equippedItems, item],
      };
    });
  };

  const unequipItem = (item: string) => {
    if (!validatePetAction()) return;

    setGameState((prev) => ({
      ...prev,
      equippedItems: prev.equippedItems.filter((i) => i !== item),
    }));
    toast("👔 Item unequipped");
  };

  const mintCoolGlasses = () =>
    executeStellarAction(
      mintGlasses,
      "🌟 Minting on Stellar...",
      "🕶️ Cool Glasses minted! Sync required to update inventory.",
      "mint"
    );

  const resetGame = () => {
    console.warn ("WARNING: Game reset was executed. All local progress is lost.");
    setGameState(INITIAL_STATE);
    toast.success("🔄 Game reset! Please reconnect your wallet.");
  };

  // Reset game state when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setGameState(INITIAL_STATE);
    } else {
      // Initial sync on connection
      syncWithBlockchain();
    }
  }, [isConnected, syncWithBlockchain]);


  return (
    <GameContext.Provider
      value={{
        gameState,
        feedPet,
        playWithPet,
        workWithPet,
        putPetToSleep,
        exercisePet, 
        mintCoolGlasses,
        equipItem,
        unequipItem,
        resetGame,
        createRealPet,
        syncWithBlockchain,
        isLoading,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return { ...context, moodState: context.moodState }; // Export moodState
};