import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useStellar } from "~/hooks/use-stellar";
import * as Tamago from "../../packages/CBP7BPKMDBW3MV6WC3JRASAWDY3OXJJ7G4WPWIMFOHV7KSDMJ7GAS52U";
import { useWallet } from "~/hooks/use-wallet";
import { toast } from "sonner";
import type { GameState, PetStats, GameContextType, MoodState, PetInvestment } from "./game-context.type";

const GameContext = createContext<GameContextType | undefined>(undefined);

// INITIAL STATE (Diperluas untuk Investasi)
const INITIAL_STATE: GameState = {
  stats: {
    hunger: 100, happy: 100, energy: 100, level: 1, xp: 0, nextLevelXp: 200, speciesId: 0,
  },
  coins: 0, inventory: [], equippedItems: [], isSleeping: false,
  lastUpdate: Date.now(), petMood: "neutral", petName: undefined, hasRealPet: false,
  investment: undefined, 
};

// INITIAL_MOOD_STATE (Dipindahkan ke dalam komponen atau tetap di luar, tidak kritis di sini)
const INITIAL_MOOD_STATE: MoodState = {
    moodType: "neutral",
    message: "A perfect day!",
    lastMoodCheck: Date.now(),
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isConnected } = useWallet();
  const { getPet, getCoins, createPet, feedPet: feedPetStellar, mintGlasses, playWithPet: playWithPetStellar, workWithPet: workWithPetStellar, putPetToSleep: putPetToSleepStellar, exercisePet: exercisePetStellar, updateCoins } = useStellar();

  // 1. STATE DECLARATIONS
  const [isLoading, setIsLoading] = useState(false);

  const [moodState, setMoodState] = useState<MoodState>(() => {
      const savedMood = localStorage.getItem("pixelPetMood");
      if (savedMood) {
        const parsedMood = JSON.parse(savedMood);
        const hoursElapsed = (Date.now() - parsedMood.lastMoodCheck) / (1000 * 60 * 60);
        if (hoursElapsed < 24) return parsedMood; 
      }
      return INITIAL_MOOD_STATE;
  });

  const [investmentState, setInvestmentState] = useState<PetInvestment | undefined>(
    () => {
      const saved = localStorage.getItem("pixelPetInvestment");
      return saved && saved !== "undefined" ? JSON.parse(saved) : undefined;
    }
  );

  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem("pixelPetGame");
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...INITIAL_STATE, ...parsed, stats: { ...INITIAL_STATE.stats, ...parsed.stats }, investment: parsed.investment };
    }
    return INITIAL_STATE;
  });
  
  // 2. CORE HELPER FUNCTIONS (Diperlukan oleh fungsi-fungsi di bawah)

  const convertPetToStats = useCallback((pet: Tamago.Pet): { stats: PetStats; petName: string } => {
    const stats: PetStats = {
        hunger: Number(pet.hunger), 
        happy: Number(pet.happiness), 
        energy: Number(pet.energy),
        level: Number((pet as any).level), 
        xp: Number((pet as any).xp), 
        nextLevelXp: Number((pet as any).next_level_xp), 
        speciesId: Number((pet as any).species_id),
    };
    return { stats, petName: pet.name };
  }, []);

  const calculateMood = useCallback((stats: PetStats, isSleeping: boolean, isAlive: boolean): GameState["petMood"] => {
    if (!isAlive) return "sad"; 
    if (isSleeping) return "sleeping";
    
    if (stats.hunger < 20 || stats.happy < 20 || stats.energy < 20) return "sad";
    const avgStat = (stats.hunger + stats.happy + stats.energy) / 3;
    if (avgStat > 80) return "happy";
    
    return "neutral";
  }, []); 

  const rollNewMood = useCallback(() => {
    const moods: MoodState[] = [
        { moodType: "boost", message: "✨ Energetic Mood: +20% efficiency on Exercise!", lastMoodCheck: Date.now() },
        { moodType: "penalty", message: "🐌 Grumpy Mood: -50% coin gain from Work.", lastMoodCheck: Date.now() },
        { moodType: "neutral", message: "A peaceful day. All actions are normal.", lastMoodCheck: Date.now() },
    ];
    const newMood = moods[Math.floor(Math.random() * moods.length)];
    setMoodState(newMood);
    toast.info(`Today's Mood: ${newMood.message}`, { duration: 8000 });
  }, []);

  // 3. COMPLEX CALLBACKS (Action & Sync Logic)

  const validatePetAction = useCallback(() => {
    if (!isConnected || !gameState.hasRealPet || isLoading || gameState.stats.hunger <= 0 || gameState.stats.happy <= 0) {
        toast.error(isConnected ? (gameState.hasRealPet ? "Action in progress or Pet is unwell." : "Please create your pet on-chain first!") : "Please connect your wallet first!");
        return false;
    }
    return true;
  }, [isConnected, gameState.hasRealPet, isLoading, gameState.stats.hunger, gameState.stats.happy]);

  // SyncWithBlockchain harus didefinisikan lebih awal
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
                const hoursElapsed = (Date.now() - moodState.lastMoodCheck) / (1000 * 60 * 60);
                if (hoursElapsed >= 24) rollNewMood();
            } else {
                toast.error("⚰️ Your pet passed away. Time to mourn.");
            }

        } else if (pet === null) {
            setGameState(prev => ({ ...INITIAL_STATE, hasRealPet: false, petName: undefined }));
        }

    } catch (error) {
        console.error("Sync failed:", error);
        toast.error("⚠️ Failed to sync with blockchain. Connection error.");
    } finally {
        setIsLoading(false);
    }
  }, [isConnected, getPet, getCoins, convertPetToStats, calculateMood, moodState.lastMoodCheck, rollNewMood]); 

  const executeStellarAction = useCallback(async (
    action: () => Promise<Tamago.Pet>, 
    loadingMessage: string, 
    successMessage: string,
    moodType: "feed" | "play" | "work" | "sleep" | "exercise" | "mint" | "create",
    skipSuccessToast: boolean = false 
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
      
      if (!skipSuccessToast) { 
        toast.success(successMessage);
      }
      
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

  const claimInvestment = useCallback(async () => {
    if (!validatePetAction() || !investmentState) return;

    setIsLoading(true);
    toast.loading("💰 Calculating and claiming investment...");

    try {
      const { amount } = investmentState;
      const profitRate = 0.5; 
      const lossRate = 0.2;   

      const roll = Math.random();
      let finalAmount = amount;
      let resultMessage = "";

      if (roll < 0.2) { 
        const loss = Math.floor(amount * lossRate);
        finalAmount = amount - loss;
        resultMessage = `❌ Oh no! You lost ${loss} coins. Final amount: ${finalAmount}`;
      } else if (roll < 0.4) { 
        finalAmount = amount;
        resultMessage = `😐 Break even! You got your ${amount} coins back.`;
      } else { 
        const profit = Math.floor(Math.random() * (amount * profitRate)); 
        finalAmount = amount + profit;
        resultMessage = `🎉 Success! You earned ${profit} coins! Final amount: ${finalAmount}`;
      }

      const netChange = finalAmount - amount;
      
      // Kirim transaksi ke Stellar untuk mint/burn sisa koin
      await updateCoins(netChange);
      
      toast.dismiss();
      toast.success(resultMessage, { duration: 8000 });
      
    } catch (error) {
      toast.dismiss();
      toast.error("⚠️ Failed to claim investment! Check console.");
    } finally {
      setInvestmentState(undefined); 
      setIsLoading(false);
      // Panggil syncWithBlockchain yang sudah didefinisikan
      syncWithBlockchain();
    }
  }, [validatePetAction, investmentState, updateCoins, syncWithBlockchain]); 

  // 4. SIMPLE ACTION HANDLERS

  const feedPet = () => executeStellarAction(feedPetStellar, "🍔 Pet is eating on Stellar...", "🍽️ Pet is full!", "feed");
  const playWithPet = () => executeStellarAction(playWithPetStellar, "🚀 QTE Success! Sending play transaction...", "😊 Pet is happy!", "play", true);
  const workWithPet = () => executeStellarAction(workWithPetStellar, "💼 Pet is working on Stellar...", "💰 Pet earned coins!", "work");
  const putPetToSleep = () => executeStellarAction(putPetToSleepStellar, "😴 Pet is sleeping on Stellar...", "💤 Pet is rested!", "sleep");
  const exercisePet = () => executeStellarAction(exercisePetStellar, "🏃 Pet is exercising on Stellar...", "💪 Pet feels stronger!", "exercise");

  const startInvestment = (amount: number, durationHours: number) => {
    if (!validatePetAction()) return;

    if (gameState.coins < amount) {
        toast.error("Not enough coins to invest!");
        return;
    }
    
    setGameState(prev => ({ ...prev, coins: prev.coins - amount }));
    
    setInvestmentState({
        amount,
        startTime: Date.now(),
        durationHours,
        isActive: true,
    });

    toast.success(`📈 Started investing ${amount} coins for ${durationHours} hours!`);
  };

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
      rollNewMood(); 
    } catch (error) {
      toast.dismiss();
      console.error("Pet creation failed:", error);
      toast.error("❌ Pet creation failed! Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const equipItem = (item: string) => { /* ... */ };
  const unequipItem = (item: string) => { /* ... */ };
  const mintCoolGlasses = () => executeStellarAction(mintGlasses, "🌟 Minting on Stellar...", "🕶️ Cool Glasses minted! Sync required to update inventory.", "mint");
  const resetGame = () => { /* ... */ };

  // 5. USE EFFECT HOOKS

  useEffect(() => {
    localStorage.setItem("pixelPetMood", JSON.stringify(moodState));
  }, [moodState]);

  useEffect(() => {
    localStorage.setItem("pixelPetInvestment", JSON.stringify(investmentState));
    setGameState(prev => ({ ...prev, investment: investmentState }));
  }, [investmentState]);

  useEffect(() => {
      const hoursElapsed = (Date.now() - moodState.lastMoodCheck) / (1000 * 60 * 60);
      if (hoursElapsed >= 24) {
          rollNewMood();
      }
  }, [moodState.lastMoodCheck, rollNewMood]);

  useEffect(() => {
    if (!isConnected) {
      setGameState(INITIAL_STATE);
    } else {
      syncWithBlockchain();
    }
  }, [isConnected, syncWithBlockchain]);

  // 6. RETURN PROVIDER
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
        moodState,
        startInvestment, 
        claimInvestment,
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
  return context; 
};