export interface PetStats {
  hunger: number; // 0-100
  happy: number; // 0-100
  energy: number; // 0-100
  // Leveling
  level: number;
  xp: number;
  nextLevelXp: number;
  // Species
  speciesId: number;
}

export interface GameState {
  stats: PetStats;
  coins: number;
  inventory: string[];
  equippedItems: string[];
  isSleeping: boolean;
  lastUpdate: number;
  petMood: "happy" | "neutral" | "sad" | "sleeping";
  petName?: string;
  hasRealPet: boolean; // Track if user has created a pet on-chain
}

export interface GameContextType {
  gameState: GameState;
  feedPet: () => void;
  playWithPet: () => void;
  workWithPet: () => void;
  putPetToSleep: () => void;
  // Exercise action
  exercisePet: () => void;
  mintCoolGlasses: () => void;
  equipItem: (item: string) => void;
  unequipItem: (item: string) => void;
  resetGame: () => void;
  createRealPet: (name: string) => void;
  syncWithBlockchain: () => void;
  isLoading: boolean;
}
