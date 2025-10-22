import React, { useCallback } from "react";
import { useGame } from "~/context/game-context";
import { CreatePetDialog } from "./create-pet-dialog";
import { useWallet } from "~/hooks/use-wallet";

export function PetDisplay() {
  const { gameState } = useGame();
  const { isConnected } = useWallet();
  const { petMood, equippedItems, isSleeping, petName, hasRealPet, stats } = gameState;
  const { level, speciesId, hunger, happy } = stats;

  // --- LOGIC VISUAL SPECIES (FRONTEND ONLY) ---
  const speciesData = {
    0: { name: "OG Blob", color: "fill-lime-500", icon: "🌱" },
    1: { name: "Aqua Squish", color: "fill-cyan-500", icon: "💧" },
    2: { name: "Fire Sprite", color: "fill-red-500", icon: "🔥" },
    default: { name: "Unknown", color: "fill-gray-500", icon: "❓" },
  };

  const petSpecies = speciesData[speciesId as keyof typeof speciesData] || speciesData.default;


  // Determine pet appearance based on mood
  const getPetColor = useCallback(() => {
    // Jika mati, gunakan warna abu-abu atau warna sedih
    if (!hasRealPet || hunger <= 0 || happy <= 0) {
      return "fill-gray-700 dark:fill-gray-500"; 
    }
    
    // Logika warna berdasarkan Mood
    switch (petMood) {
      case "happy":
        return petSpecies.color; 
      case "sad":
        return "fill-yellow-600 dark:fill-yellow-500"; 
      case "sleeping":
        return "fill-blue-500"; 
      default:
        return petSpecies.color;
    }
  }, [petMood, hasRealPet, hunger, happy, petSpecies.color]);


  // --- KOMPONEN SVG PET ---
  const PetSVG = ({ color }: { color: string }) => {
    
    // Logic untuk pet mati
    if (!hasRealPet || hunger <= 0 || happy <= 0) {
        return (
            <svg width="180" height="180" viewBox="0 0 24 24" className="drop-shadow-lg" style={{ imageRendering: "pixelated" }}>
                {/* Batu Nisan / Tombstone */}
                <rect x="9" y="10" width="6" height="8" className="fill-gray-600 dark:fill-gray-400" />
                <rect x="8" y="18" width="8" height="1" className="fill-gray-800 dark:fill-gray-600" />
                <text x="12" y="15" className="fill-white" textAnchor="middle" style={{ fontFamily: 'Press Start 2P', fontSize: '3px' }}>R.I.P</text>
            </svg>
        );
    }
    
    // Pet Aktif (Logic SVG Lama + Warna Species)
    const hasGlasses = equippedItems.includes("cool-glasses");
    
    return (
        <svg
          width="180"
          height="180"
          viewBox="0 0 24 24"
          className="drop-shadow-lg"
          style={{ imageRendering: "pixelated" }}
        >
          {/* Body - Rounded blob shape */}
          <rect x="6" y="8" width="12" height="10" className={color} />
          <rect x="5" y="10" width="2" height="6" className={color} />
          <rect x="17" y="10" width="2" height="6" className={color} />
          <rect x="7" y="7" width="10" height="1" className={color} />
          <rect x="7" y="18" width="10" height="1" className={color} />

          {/* Ears */}
          <rect x="5" y="6" width="2" height="3" className={color} />
          <rect x="17" y="6" width="2" height="3" className={color} />

          {/* Eyes */}
          {petMood === "sleeping" ? (
            <>
              <rect x="9" y="11" width="2" height="1" className="fill-foreground" />
              <rect x="13" y="11" width="2" height="1" className="fill-foreground" />
            </>
          ) : (
            <>
              <rect x="9" y="11" width="2" height="2" className="fill-foreground" />
              <rect x="13" y="11" width="2" height="2" className="fill-foreground" />
            </>
          )}

          {/* Mouth - changes based on mood */}
          {(petMood === "happy" || petMood === "neutral") && (
            <>
              <rect x="9" y="15" width="1" height="1" className="fill-foreground" />
              <rect x="10" y="16" width="4" height="1" className="fill-foreground" />
              <rect x="14" y="15" width="1" height="1" className="fill-foreground" />
            </>
          )}
          {petMood === "sad" && (
            // Wajah Sedih / Cemberut
            <>
              <rect x="9" y="16" width="1" height="1" className="fill-foreground" />
              <rect x="10" y="15" width="4" height="1" className="fill-foreground" />
              <rect x="14" y="16" width="1" height="1" className="fill-foreground" />
            </>
          )}

          {/* Cool Glasses overlay */}
          {hasGlasses && (
            <g>
              <rect x="8" y="10" width="3" height="3" className="fill-foreground opacity-80" />
              <rect x="13" y="10" width="3" height="3" className="fill-foreground opacity-80" />
              <rect x="11" y="11" width="2" height="1" className="fill-foreground" />
            </g>
          )}

          {/* Feet */}
          <rect x="8" y="19" width="2" height="2" className={color} />
          <rect x="14" y="19" width="2" height="2" className={color} />
        </svg>
    );
  };
  // --- END SVG PET ---


  return (
    <div className="relative flex flex-col items-center justify-center py-8">
      {/* Pet Container */}
      <div
        className={`relative ${isSleeping ? "" : "animate-bounce"}`}
        style={{ animationDuration: "2s" }}
      >
        <PetSVG color={getPetColor()} />

        {/* Sleep Z's */}
        {isSleeping && (
          <div className="absolute -top-4 right-0 text-2xl animate-pulse">
            <div className="pixel-text-shadow">💤</div>
          </div>
        )}
      </div>

      {/* Pet Status Text */}
      <div className="mt-4 text-center">
        {petName && <h3 className="text-lg font-bold pixel-text-shadow mb-1">{petName}</h3>}
        
        {/* BARU: Level dan Species ID */}
        {hasRealPet && (
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                <p>LEVEL {level} • {petSpecies.icon} {petSpecies.name} (ID: {speciesId})</p>
            </div>
        )}
        {/* END BARU */}
        
        <p className="text-sm text-foreground uppercase tracking-wider">
          {isSleeping
            ? "💤 Sleeping"
            : petMood === "happy"
              ? "😊 Happy"
              : petMood === "sad"
                ? "😢 Sad"
                : "😐 Okay"}
        </p>
        
        {isConnected && hasRealPet && (
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 border border-green-300">
              ⭐ On Stellar
            </span>
          </div>
        )}
        {isConnected && !hasRealPet && (
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 border border-yellow-300 mb-3">
              🏠 Local Pet
            </span>
            <div>
              <CreatePetDialog />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}