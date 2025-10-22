import React from "react";
import { Button } from "~/components/ui/button";
import { useGame } from "~/context/game-context";
import { Utensils, Gamepad2, Briefcase, Moon, Dumbbell } from "lucide-react";

export function ActionButtons() {
  // Perbaikan: Ambil isLoading dari useGame(), bukan dari gameState
  const { feedPet, playWithPet, workWithPet, putPetToSleep, exercisePet, gameState, isLoading } = useGame(); 

  const buttons = [
    {
      label: "Feed",
      icon: Utensils,
      action: feedPet,
      variant: "default" as const,
      disabled: gameState.isSleeping,
    },
    {
      label: "Play",
      icon: Gamepad2,
      action: playWithPet,
      variant: "secondary" as const,
      disabled: gameState.isSleeping,
    },
    {
      label: "Work",
      icon: Briefcase,
      action: workWithPet,
      variant: "outline" as const,
      disabled: gameState.isSleeping,
    },
    // BARU: Tombol Exercise
    {
      label: "Exercise",
      icon: Dumbbell,
      action: exercisePet,
      variant: "default" as const,
      disabled: gameState.isSleeping,
    },
    // Tombol Sleep
    {
      label: "Sleep",
      icon: Moon,
      action: putPetToSleep,
      variant: "outline" as const,
      disabled: gameState.isSleeping,
    },
  ];
  
  return (
    <div className="grid grid-cols-2 gap-3 w-full max-w-md">
      {buttons.map((btn) => (
        <Button
          key={btn.label}
          onClick={btn.action}
          // Gunakan isLoading yang sudah diambil
          disabled={btn.disabled || isLoading} 
          variant={btn.variant}
          size="lg"
          // Tambahkan kelas untuk tombol Sleep agar mengambil lebar penuh
          className={`
            h-16 sm:h-20 flex flex-col items-center justify-center gap-1 pixel-shadow 
            hover:translate-y-1 transition-transform disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm
            ${btn.label === 'Sleep' ? 'col-span-2' : ''} 
          `}
        >
          <btn.icon className="h-5 w-5 sm:h-6 sm:w-6" />
          <span>{btn.label}</span>
        </Button>
      ))}
    </div>
  );
}