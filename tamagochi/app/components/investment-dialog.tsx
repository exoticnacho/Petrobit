import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { DollarSign, Clock, CheckCircle } from "lucide-react";
import { useGame } from "~/context/game-context";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const InvestmentOptions = [
  { amount: 100, durationHours: 4, label: "Short Term (4 Jam)" },
  { amount: 500, durationHours: 12, label: "Medium Term (12 Jam)" },
  { amount: 1000, durationHours: 24, label: "Long Term (24 Jam)" },
];

export function InvestmentDialog({ children }: { children: React.ReactNode }) {
  const { gameState, startInvestment, claimInvestment, isLoading } = useGame();
  const [selectedOption, setSelectedOption] = useState(InvestmentOptions[0]);
  const [open, setOpen] = useState(false);

  const activeInvestment = gameState.investment;
  const currentTime = Date.now();

  const handleStart = () => {
    startInvestment(selectedOption.amount, selectedOption.durationHours);
    setOpen(false);
  };

  const calculateProgress = () => {
    if (!activeInvestment) return 0;
    const durationMs = activeInvestment.durationHours * 60 * 60 * 1000;
    const elapsedMs = currentTime - activeInvestment.startTime;
    return Math.min((elapsedMs / durationMs) * 100, 100);
  };

  const isReadyToClaim = activeInvestment && calculateProgress() >= 100;
  const timeRemainingMs = activeInvestment ? Math.max(0, activeInvestment.startTime + activeInvestment.durationHours * 60 * 60 * 1000 - currentTime) : 0;
  
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${hours}j ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}d`;
    return `${seconds}d`;
  };


  const renderActiveInvestment = () => (
    <>
      <DialogHeader>
        <DialogTitle className="font-pixel text-xl flex items-center gap-2 text-yellow-500">
          <Clock className="w-6 h-6" />
          Investment Active
        </DialogTitle>
        <DialogDescription>
          Your {activeInvestment!.amount} coins are growing!
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="bg-muted p-4 border-2 border-border">
          <p className="text-xs font-bold mb-2">PROGRESS: {Math.round(calculateProgress())}%</p>
          <div className="h-4 bg-background border border-border">
            <div 
              style={{ width: `${calculateProgress()}%` }} 
              className="h-full bg-yellow-500 transition-all duration-1000"
            />
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground text-center">
            {isReadyToClaim ? (
                <span className="font-bold text-green-500">Ready to Claim!</span>
            ) : (
                `Time Remaining: ${formatTime(timeRemainingMs)}`
            )}
        </p>
      </div>

      <DialogFooter className="mt-4">
        <Button 
            onClick={claimInvestment} 
            disabled={!isReadyToClaim || isLoading}
            className="bg-green-600 hover:bg-green-700 w-full"
        >
            {isLoading ? "Claiming..." : isReadyToClaim ? "CLAIM REWARD" : "Wait..."}
        </Button>
      </DialogFooter>
    </>
  );

  const renderNewInvestment = () => (
    <>
      <DialogHeader>
        <DialogTitle className="font-pixel text-xl flex items-center gap-2">
            <DollarSign className="w-6 h-6" />
            Invest Coins
        </DialogTitle>
        <DialogDescription>
          Lock your coins for profit, but risk losing some!
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <Label className="font-pixel text-sm">Select Option:</Label>
        <div className="space-y-2">
            {InvestmentOptions.map((option) => (
                <div 
                    key={option.label}
                    onClick={() => setSelectedOption(option)}
                    className={`p-3 border-2 border-border cursor-pointer transition-all ${
                        selectedOption.label === option.label ? 'bg-primary text-primary-foreground pixel-shadow' : 'bg-muted'
                    }`}
                >
                    <p className="font-bold text-sm">{option.label}</p>
                    <p className="text-xs">Cost: {option.amount} Coins (Max Profit: +{option.amount * 0.5} Coins)</p>
                </div>
            ))}
        </div>
        <p className="text-sm text-center text-muted-foreground">
            You have **{gameState.coins}** Coins.
        </p>
      </div>

      <DialogFooter>
        <Button
            onClick={handleStart}
            disabled={gameState.coins < selectedOption.amount || isLoading}
            className="bg-green-600 hover:bg-green-700 w-full"
        >
            Start Investment ({selectedOption.amount} Coins)
        </Button>
      </DialogFooter>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-xs pixel-border bg-card">
        {activeInvestment ? renderActiveInvestment() : renderNewInvestment()}
      </DialogContent>
    </Dialog>
  );
}