import { PetDisplay } from "~/components/pet-display";
import { StatsBar } from "~/components/stats-bar";
import { Wardrobe } from "~/components/wardrobe";
import { ActionButtons } from "~/components/action-button";
import { useGame } from "~/context/game-context";

export default function Home() {
  const { gameState } = useGame();

  // Hitung persentase XP (XP / XP yang dibutuhkan untuk level berikutnya)
  const xpPercentage = Math.min(
    (gameState.stats.xp / gameState.stats.nextLevelXp) * 100,
    100
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
      {/* Pet Display */}
      <div className="bg-card border-4 border-border pixel-shadow p-4 sm:p-8">
        <PetDisplay />
      </div>

      {/* Stats Section */}
      <div className="bg-card border-4 border-border pixel-shadow p-4 sm:p-6 space-y-3 sm:space-y-4">
        <h2 className="text-sm sm:text-base font-bold uppercase text-center pixel-text-shadow mb-4">
          Pet Stats
        </h2>
        {/* Stats Bar Lama */}
        <StatsBar label="Hunger" value={gameState.stats.hunger} icon="🍖" color="hunger" />
        <StatsBar label="Happy" value={gameState.stats.happy} icon="😊" color="happy" />
        <StatsBar label="Energy" value={gameState.stats.energy} icon="⚡" color="energy" />
        
        {/* BARU: XP Bar - Menggunakan XP dan NextLevelXp */}
        <StatsBar 
          label={`Level ${gameState.stats.level} Progress`} 
          value={xpPercentage} 
          icon="⭐" 
          color="level" // Menggunakan 'level' (sudah diperbaiki di stats-bar.tsx)
        />
        {/* END BARU */}
        
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col items-center gap-3">
        <ActionButtons />
        <Wardrobe />
      </div>

      {/* Instructions */}
      <div className="bg-muted border-2 border-border p-4 text-center">
        <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
          💡 <strong>Tip:</strong> Feed, play, work, and rest to keep your pet happy! Stats decay
          over time. Earn coins from work to unlock cool items. 🎮
        </p>
      </div>
    </div>
  );
}