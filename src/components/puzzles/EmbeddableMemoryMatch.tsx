/**
 * EmbeddableMemoryMatch — A self-contained Memory Match game
 * designed to be embedded inside the AdvancedQuizPlayer (quiz window).
 *
 * Props:
 *   onComplete(result)  — called when the game finishes (completed / time_up)
 *   puzzleType           — "memory_match"
 *
 * The component skips intro/mode-select screens and immediately goes into
 * "individual" mode (10 pairs, 20 cards) so it fits within the quiz flow.
 * It does NOT call the backend /puzzles/evaluate endpoint;
 * instead it returns the raw game data via onComplete for the quiz to store.
 */
import React, { useEffect, useState } from "react";
import { Clock, Trophy, Target, Zap, Eye, X, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMemoryImages } from "./memoryMatchGrid/imageUtils";

type CardType = {
  id: number;
  image: string;
  matched: boolean;
  index: number;
};

type ExitType = "completed" | "time_up" | null;

const PREVIEW_TIME = 15;
const SOLVE_TIME = 180;

interface EmbeddableMemoryMatchProps {
  onComplete: (result: {
    puzzleType: string;
    mode: string;
    totalPairs: number;
    totalClicks: number;
    incorrectClicks: number;
    nearbyClicks: number;
    correctPairs: number;
    timeTaken: number;
    endReason: string;
    score: number; // 0-100 computed locally
  }) => void;
}

/* ---- local heuristic score identical to backend /puzzles/evaluate ---- */
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const computeScore = (
  totalPairs: number,
  totalClicks: number,
  incorrectClicks: number,
  nearbyClicks: number,
  correctPairs: number,
  timeTaken: number,
  endReason: string
) => {
  const MAX_TIME = 180;
  const accuracy = clamp01(correctPairs / totalPairs);
  const idealClicks = 2 * correctPairs;
  const extraClicks = Math.max(0, totalClicks - idealClicks);
  const maxExtraClicks = 4 * totalPairs;
  const efficiency = clamp01(1 - extraClicks / maxExtraClicks);
  const speed = clamp01(1 - timeTaken / MAX_TIME);
  const effectiveErrors = Math.max(0, incorrectClicks - 0.3 * nearbyClicks);
  const control = clamp01(1 - effectiveErrors / totalPairs);

  let fitnessScore = 0.4 * accuracy + 0.25 * efficiency + 0.2 * speed + 0.15 * control;

  let penalty = 0;
  if (endReason === "EXITED") {
    penalty = 0.25;
    if (accuracy < 0.3) penalty += 0.15;
  } else if (endReason === "TIME_UP") {
    penalty = accuracy >= 0.8 ? 0 : 0.05;
  }

  fitnessScore = clamp01(fitnessScore - penalty);
  return Math.round(fitnessScore * 100);
};

const EmbeddableMemoryMatch: React.FC<EmbeddableMemoryMatchProps> = ({ onComplete }) => {
  const mode = "individual";
  const pairCount = 10;
  const gridCols = 5;
  const gridRows = 4;

  const [cards, setCards] = useState<CardType[]>([]);
  const [flipped, setFlipped] = useState<CardType[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);

  const [previewTimer, setPreviewTimer] = useState(PREVIEW_TIME);
  const [solveTimer, setSolveTimer] = useState(SOLVE_TIME);
  const [previewPhase, setPreviewPhase] = useState(true);

  const [totalClicks, setTotalClicks] = useState(0);
  const [incorrectClicks, setIncorrectClicks] = useState(0);
  const [nearbyClicks, setNearbyClicks] = useState(0);

  const [submitted, setSubmitted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  /* ---- Auto-start game on mount ---- */
  useEffect(() => {
    const allImages = getMemoryImages();
    const images = allImages.slice(0, pairCount);
    const shuffled = [...images, ...images]
      .map((img, i) => ({ id: i, image: img, matched: false, index: i }))
      .sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setStartTime(Date.now());
    setGameStarted(true);
  }, []);

  /* ---- Preview timer ---- */
  useEffect(() => {
    if (!gameStarted || !previewPhase) return;
    if (previewTimer === 0) { setPreviewPhase(false); return; }
    const t = setTimeout(() => setPreviewTimer(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [previewTimer, previewPhase, gameStarted]);

  /* ---- Solve timer ---- */
  useEffect(() => {
    if (!gameStarted || previewPhase || submitted) return;
    if (solveTimer === 0) { finishGame("time_up"); return; }
    const t = setTimeout(() => setSolveTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [solveTimer, previewPhase, gameStarted, submitted]);

  /* ---- Auto complete ---- */
  useEffect(() => {
    if (gameStarted && matches === pairCount && !submitted) {
      finishGame("completed");
    }
  }, [matches]);

  const handleFlip = (card: CardType) => {
    if (previewPhase || flipped.length === 2 || card.matched || flipped.includes(card) || submitted) return;
    setTotalClicks(c => c + 1);
    const newFlipped = [...flipped, card];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      if (newFlipped[0].image === newFlipped[1].image) {
        setCards(prev => prev.map(c => (c.image === card.image ? { ...c, matched: true } : c)));
        setMatches(m => m + 1);
        setFlipped([]);
      } else {
        setIncorrectClicks(i => i + 1);
        if (Math.abs(newFlipped[0].index - newFlipped[1].index) <= 2) {
          setNearbyClicks(n => n + 1);
        }
        setTimeout(() => setFlipped([]), 700);
      }
    }
  };

  const finishGame = (type: ExitType) => {
    if (submitted) return;
    setSubmitted(true);
    const endReason = type === "completed" ? "COMPLETED" : "TIME_UP";
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const score = computeScore(pairCount, totalClicks, incorrectClicks, nearbyClicks, matches, timeTaken, endReason);

    onComplete({
      puzzleType: "memory_match",
      mode,
      totalPairs: pairCount,
      totalClicks,
      incorrectClicks,
      nearbyClicks,
      correctPairs: matches,
      timeTaken,
      endReason,
      score,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full bg-gradient-to-br from-indigo-50 via-white to-pink-50 rounded-xl p-3">
      {/* Phase banner + timer */}
      <div className="flex items-center justify-between mb-3">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-white ${
          previewPhase ? "bg-gradient-to-r from-blue-500 to-cyan-500" : "bg-gradient-to-r from-purple-500 to-pink-500"
        }`}>
          {previewPhase ? <><Eye className="h-3.5 w-3.5" /> स्थिति याद करें!</> : <><Target className="h-3.5 w-3.5" /> जोड़ियाँ ढूँढें!</>}
        </div>

        <div className="flex items-center gap-4">
          {/* Matches */}
          <div className="flex items-center gap-1.5 text-sm">
            <Target className="h-4 w-4 text-green-600" />
            <span className="font-bold text-green-600">{matches}/{pairCount}</span>
          </div>
          {/* Moves */}
          <div className="flex items-center gap-1.5 text-sm">
            <Zap className="h-4 w-4 text-purple-600" />
            <span className="font-bold text-purple-600">{moves}</span>
          </div>
          {/* Timer */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold text-white ${
            previewPhase ? "bg-blue-500" : solveTimer <= 30 ? "bg-red-500 animate-pulse" : "bg-indigo-600"
          }`}>
            <Clock className="h-3.5 w-3.5" />
            {previewPhase ? formatTime(previewTimer) : formatTime(solveTimer)}
          </div>
        </div>
      </div>

      {/* Card Grid */}
      <div className="flex items-center justify-center">
        <div
          className="grid gap-1.5"
          style={{
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
            gridTemplateRows: `repeat(${gridRows}, 1fr)`,
            width: "fit-content",
          }}
        >
          {cards.map((card) => {
            const visible = previewPhase || flipped.includes(card) || card.matched;
            return (
              <div
                key={card.id}
                onClick={() => handleFlip(card)}
                className={`w-[4.5rem] h-[4.5rem] md:w-20 md:h-20 relative cursor-pointer rounded-xl overflow-hidden shadow-md
                  transform transition-all duration-200
                  ${!visible && !card.matched ? "hover:scale-105 hover:shadow-xl active:scale-95" : ""}
                  ${card.matched ? "opacity-50 scale-90" : ""}`}
              >
                <div className={`w-full h-full ${
                  visible ? "bg-white border-2 border-indigo-200" : "bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-500"
                }`}>
                  {visible ? (
                    <img
                      src={card.image}
                      alt="card"
                      className="w-full h-full object-cover p-1 rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://via.placeholder.com/150/6366f1/ffffff?text=${card.index + 1}`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-white text-2xl font-bold drop-shadow-lg">?</span>
                    </div>
                  )}
                </div>
                {card.matched && (
                  <div className="absolute inset-0 flex items-center justify-center bg-green-400/40">
                    <Trophy className="w-4 h-4 text-green-600" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 rounded-full"
            style={{ width: `${(matches / pairCount) * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1 text-center">{Math.round((matches / pairCount) * 100)}% पूर्ण</p>
      </div>
    </div>
  );
};

export default EmbeddableMemoryMatch;
