import React, { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "./ui/dialog";
import { useGame } from "~/context/game-context";
import { Zap } from "lucide-react";
import { cn } from "~/lib/utils";
import { toast } from "sonner";

// --- QTE Configuration ---
const QTE_DURATION_MS = 1500; // Time user has to click the target
const SUCCESS_WINDOW_MS = 200; // Time window for success (target) is 200ms

export function QuickTimeEventDialog({ children }: { children: React.ReactNode }) {
  const { playWithPet, isLoading } = useGame();
  const [open, setOpen] = useState(false);
  const [gameStart, setGameStart] = useState(0);
  const [targetOffset, setTargetOffset] = useState(0); // Offset for the target button
  const [gameState, setGameState] = useState<"idle" | "running" | "finished">("idle");
  const timerRef = useRef<number | null>(null);

  const startGame = useCallback(() => {
    if (isLoading) return;
    setGameState("running");
    setGameStart(Date.now());
    // Set random offset for the target between 10% and 90%
    setTargetOffset(Math.random() * (0.8) + 0.1); 

    // Set timeout for game failure (if user misses entirely)
    timerRef.current = window.setTimeout(() => {
      setGameState("finished");
      toast.dismiss();
      toast.error("Too slow! Pet got bored. Play failed.");
      setOpen(false);
    }, QTE_DURATION_MS);
  }, [isLoading]);

  const handleClose = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }
    setGameState("idle");
    setOpen(false);
  }, []);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      // Delay starting game to allow modal to open
      setTimeout(startGame, 300); 
    } else {
      handleClose();
    }
  }, [startGame, handleClose]);

  const handleTargetClick = useCallback(async () => {
    if (gameState !== "running") return;

    const timeElapsed = Date.now() - gameStart;
    
    // Calculate the expected center time of the success window
    const successCenterTime = QTE_DURATION_MS * targetOffset;
    const tolerance = SUCCESS_WINDOW_MS / 2;
    
    setGameState("finished");
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }
    
    if (timeElapsed >= (successCenterTime - tolerance) && timeElapsed <= (successCenterTime + tolerance)) {
      // Success: Clicked within the target window
      toast.dismiss();
      toast.success("💥 Perfect timing! Pet is thrilled.");
      // EXECUTE STELLAR TRANSACTION ONLY ON SUCCESS
      await playWithPet();
    } else {
      // Failure (too early/too late but still clicked before timeout)
      toast.dismiss();
      toast.error("Missed! Pet wasn't impressed. Play failed.");
    }
    setOpen(false); // Close the modal
  }, [gameState, gameStart, targetOffset, playWithPet]);

  // Render Logic
  const barWidth = 300; // Fixed width for the bar container
  const targetPosition = targetOffset * barWidth - (10); // Calculate position (10px is half target size)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-xs pixel-border bg-card" showCloseButton={false}>
        <DialogHeader className="items-center">
          <Zap className="w-8 h-8 text-yellow-500" />
          <DialogTitle className="text-lg sm:text-xl pixel-text-shadow">Quick Play!</DialogTitle>
          <DialogDescription className="text-center">
            Hit the <span className="text-red-500 font-bold">RED</span> target when the bar reaches it!
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          {gameState === "running" && (
            <div className="relative w-[300px] h-10 bg-muted border-2 border-border">
              {/* Target Area */}
              <div 
                className="absolute top-0 h-full w-5 bg-destructive border-l-2 border-r-2 border-border z-10"
                style={{ left: `${targetPosition}px` }} 
              />
              {/* Moving Bar */}
              <div 
                className={cn("absolute top-0 left-0 h-full w-2 bg-primary z-20",
                    gameState === "running" ? "animate-qte-move" : "",
                )}
                style={{ animationDuration: `${QTE_DURATION_MS}ms` }}
              />
            </div>
          )}
          
          {/* Main Button to Interact/Click */}
          <Button
            onClick={handleTargetClick}
            disabled={isLoading || gameState !== "running"}
            variant="default"
            size="lg"
            className="w-full h-12 flex flex-col items-center justify-center pixel-shadow"
          >
            {gameState === "running" ? "HIT!" : "Get Ready..."}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}