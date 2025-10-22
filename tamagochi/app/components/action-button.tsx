import React from "react";
import { Button } from "~/components/ui/button";
import { useGame } from "~/context/game-context";
import { Utensils, Gamepad2, Briefcase, Moon, Dumbbell, DollarSign } from "lucide-react";
import { QuickTimeEventDialog } from "./quick-time-event-dialog";
import { InvestmentDialog } from "./investment-dialog";

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
      isQTE: false,
    },
    {
      label: "Play",
      icon: Gamepad2,
      action: playWithPet,
      variant: "secondary" as const,
      disabled: gameState.isSleeping,
      isQTE: true, // TANDAI SEBAGAI QTE
    },
    {
      label: "Work",
      icon: Briefcase,
      action: workWithPet,
      variant: "outline" as const,
      disabled: gameState.isSleeping,
      isQTE: false,
    },
    // Tombol Exercise
    {
      label: "Exercise",
      icon: Dumbbell,
      action: exercisePet,
      variant: "default" as const,
      disabled: gameState.isSleeping,
      isQTE: false,
    },
    // Tombol Sleep
    {
      label: "Sleep",
      icon: Moon,
      action: putPetToSleep,
      variant: "outline" as const,
      disabled: gameState.isSleeping,
      isQTE: false,
    },

    {
      label: "Invest",
      icon: DollarSign,
      action: () => {}, // Aksi ditangani di dialog
      variant: "accent" as const, // Gunakan accent (gold)
      disabled: gameState.isSleeping || gameState.investment?.isActive,
      isQTE: false,
      isInvestment: true,
    },
  ];
  
  return (
    <div className="grid grid-cols-2 gap-3 w-full max-w-md">
      {buttons.map((btn) => {
        const buttonContent = (
            <Button
              key={btn.label}
              onClick={!btn.isQTE ? btn.action : undefined} 
              disabled={btn.disabled || isLoading} 
              // Atur col-span agar tombol Investasi/Play/Sleep terlihat rapi
              variant={btn.variant}
              size="lg"
              className={`
                h-16 sm:h-20 flex flex-col items-center justify-center gap-1 pixel-shadow 
                hover:translate-y-1 transition-transform disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm
                ${btn.label === 'Sleep' ? 'col-span-2' : btn.isInvestment ? 'col-span-1' : btn.isQTE ? 'col-span-1' : ''}
              `}
            >
              <btn.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              <span>{btn.label}</span>
            </Button>
        );

        if (btn.isQTE) {
            return (
                <QuickTimeEventDialog key={btn.label}>
                    {buttonContent}
                </QuickTimeEventDialog>
            );
        }
        
        if (btn.isInvestment) {
            return (
                <InvestmentDialog key={btn.label}>
                    {buttonContent}
                </InvestmentDialog>
            );
        }

        return buttonContent;
      })}
    </div>
  );
}