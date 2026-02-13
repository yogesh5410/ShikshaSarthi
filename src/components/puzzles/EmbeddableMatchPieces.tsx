/**
 * EmbeddableMatchPieces — A self-contained Match Pieces puzzle
 * designed to be embedded inside the AdvancedQuizPlayer (quiz window).
 *
 * Props:
 *   onComplete(result)  — called when the game finishes
 *
 * Auto-starts the game with 3 random images, 9 pieces each, 3 min timer.
 * Does NOT call backend /puzzles/evaluate-pieces; returns raw data via onComplete.
 */
import React, { useEffect, useState, useCallback } from "react";
import {
  Clock, Trophy, Target, Eye, Puzzle, CheckCircle2, Grid3X3, ImageIcon, Info, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ============================================================
   TYPES
   ============================================================ */
type PieceType = {
  id: number;
  imageIndex: number;
  correctRow: number;
  correctCol: number;
  correctPosition: number;
};
type PlacedPiece = PieceType | null;
type ImageData = { src: string; label: string; description: string };
type PerImageResult = {
  imageIndex: number;
  correctPlacements: number;
  totalPieces: number;
  swapCount: number;
  moveCount: number;
  timeTakenMs: number;
};
type ExitType = "completed" | "time_up" | null;

const SOLVE_TIME = 180;

/* ---- Image pool (same as standalone) ---- */
const ALL_PUZZLE_IMAGES: ImageData[] = [
  { src: "/images/memory_1.png",  label: "चित्र 1",  description: "यह एक रंगीन चित्र है — टुकड़ों को सही जगह रखें।" },
  { src: "/images/memory_2.png",  label: "चित्र 2",  description: "इस चित्र के हर हिस्से को पहचानें।" },
  { src: "/images/memory_3.png",  label: "चित्र 3",  description: "रंगों और आकारों पर ध्यान दें।" },
  { src: "/images/memory_4.png",  label: "चित्र 4",  description: "प्रत्येक टुकड़ा एक विशेष स्थान पर फिट होता है।" },
  { src: "/images/memory_5.png",  label: "चित्र 5",  description: "पैटर्न को पहचानें और टुकड़ों को जोड़ें।" },
  { src: "/images/memory_6.png",  label: "चित्र 6",  description: "रंगों के क्रम पर ध्यान दें।" },
  { src: "/images/memory_7.png",  label: "चित्र 7",  description: "किनारों और कोनों को मिलाकर चित्र पूरा करें।" },
  { src: "/images/memory_8.png",  label: "चित्र 8",  description: "हर टुकड़े की स्थिति ध्यान से पहचानें।" },
  { src: "/images/memory_9.png",  label: "चित्र 9",  description: "अपनी पहचान क्षमता का उपयोग करें।" },
  { src: "/images/memory_10.png", label: "चित्र 10", description: "टुकड़ों को सही क्रम में लगाएं।" },
  { src: "/images/memory_11.png", label: "चित्र 11", description: "हर हिस्से को ध्यान से देखें।" },
  { src: "/images/memory_12.png", label: "चित्र 12", description: "रंग और बनावट से मूल चित्र बनाएं।" },
  { src: "/images/memory_13.png", label: "चित्र 13", description: "इस पहेली को सुलझाने के लिए ध्यान केंद्रित करें।" },
  { src: "/images/memory_14.png", label: "चित्र 14", description: "चित्र के हर कोने को ध्यान से पहचानें।" },
  { src: "/images/memory_15.png", label: "चित्र 15", description: "रंगों और रेखाओं का मिलान करें।" },
  { src: "/images/memory_16.png", label: "चित्र 16", description: "मूल चित्र से तुलना करें।" },
  { src: "/images/memory_17.png", label: "चित्र 17", description: "चुनौतीपूर्ण चित्र — ध्यान से जोड़ें।" },
  { src: "/images/memory_18.png", label: "चित्र 18", description: "हर टुकड़े की सही जगह खोजें।" },
  { src: "/images/memory_19.png", label: "चित्र 19", description: "दृश्य पहचान क्षमता दिखाएं।" },
  { src: "/images/memory_20.png", label: "चित्र 20", description: "खींचकर ग्रिड में सही स्थान पर रखें।" },
  { src: "/images/memory_21.png", label: "चित्र 21", description: "अंतिम चित्र पूरा करें।" },
];

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/* ---- Local heuristic score (mirrors backend /puzzles/evaluate-pieces) ---- */
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const computePiecesScore = (
  totalCorrect: number,
  imagesCompleted: number,
  totalImages: number,
  totalMoves: number,
  timeTaken: number,
  totalSwaps: number,
  endReason: string
) => {
  const TOTAL_PIECES = 27;
  const MAX_TIME = 180;

  const accuracy = clamp01(totalCorrect / TOTAL_PIECES);
  const completion = clamp01(imagesCompleted / totalImages);
  const idealMoves = totalCorrect;
  const extraMoves = Math.max(0, totalMoves - idealMoves);
  const maxExtraMoves = TOTAL_PIECES * 3;
  const efficiency = clamp01(1 - extraMoves / maxExtraMoves);
  const speed = clamp01(1 - timeTaken / MAX_TIME);
  const maxSwaps = TOTAL_PIECES * 2;
  const swapEfficiency = clamp01(1 - totalSwaps / maxSwaps);
  let sequentialBonus = 0;
  if (imagesCompleted >= 1) sequentialBonus += 0.05;
  if (imagesCompleted >= 2) sequentialBonus += 0.05;
  if (imagesCompleted >= 3) sequentialBonus += 0.05;
  const spatialReasoning = clamp01(swapEfficiency * 0.7 + sequentialBonus + accuracy * 0.15);

  let fitnessScore = 0.30 * accuracy + 0.25 * completion + 0.15 * efficiency + 0.15 * speed + 0.15 * spatialReasoning;

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

/* ============================================================
   Props
   ============================================================ */
interface EmbeddableMatchPiecesProps {
  onComplete: (result: {
    puzzleType: string;
    totalImages: number;
    imagesCompleted: number;
    perImage: PerImageResult[];
    totalMoves: number;
    timeTaken: number;
    endReason: string;
    score: number;
  }) => void;
}

/* ============================================================
   COMPONENT
   ============================================================ */
const EmbeddableMatchPieces: React.FC<EmbeddableMatchPiecesProps> = ({ onComplete }) => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [scatteredPieces, setScatteredPieces] = useState<PieceType[]>([]);
  const [grid, setGrid] = useState<PlacedPiece[]>(Array(9).fill(null));
  const [solveTimer, setSolveTimer] = useState(SOLVE_TIME);
  const [startTime, setStartTime] = useState(0);
  const [imageStartTime, setImageStartTime] = useState(0);
  const [swapCounts, setSwapCounts] = useState<number[]>([0, 0, 0]);
  const [perImageMoves, setPerImageMoves] = useState<number[]>([0, 0, 0]);
  const [perImageTimes, setPerImageTimes] = useState<number[]>([0, 0, 0]);
  const [completedImages, setCompletedImages] = useState<boolean[]>([false, false, false]);
  const [perImageCorrect, setPerImageCorrect] = useState<number[]>([0, 0, 0]);
  const [totalMoves, setTotalMoves] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [draggedPiece, setDraggedPiece] = useState<{ piece: PieceType; from: "scattered" | number } | null>(null);
  const [dragOverPos, setDragOverPos] = useState<number | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<{ piece: PieceType; from: "scattered" | number } | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  /* ---- Setup on mount ---- */
  const setupPiecesForImage = useCallback((imgIdx: number) => {
    const pieces: PieceType[] = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        pieces.push({ id: imgIdx * 9 + r * 3 + c, imageIndex: imgIdx, correctRow: r, correctCol: c, correctPosition: r * 3 + c });
      }
    }
    setScatteredPieces(shuffle(pieces));
    setGrid(Array(9).fill(null));
  }, []);

  useEffect(() => {
    const picked = shuffle(ALL_PUZZLE_IMAGES).slice(0, 3);
    setImages(picked);
    setCurrentImageIdx(0);
    setCompletedImages([false, false, false]);
    setSwapCounts([0, 0, 0]);
    setPerImageMoves([0, 0, 0]);
    setPerImageTimes([0, 0, 0]);
    setPerImageCorrect([0, 0, 0]);
    setTotalMoves(0);
    setSolveTimer(SOLVE_TIME);
    setStartTime(Date.now());
    setImageStartTime(Date.now());
    setSubmitted(false);
    setGameStarted(true);
    // setup pieces for first image after images are set
    const pieces: PieceType[] = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        pieces.push({ id: r * 3 + c, imageIndex: 0, correctRow: r, correctCol: c, correctPosition: r * 3 + c });
      }
    }
    setScatteredPieces(shuffle(pieces));
    setGrid(Array(9).fill(null));
  }, []);

  /* ---- Timer ---- */
  useEffect(() => {
    if (!gameStarted || submitted) return;
    if (solveTimer === 0) { finishGame("time_up"); return; }
    const t = setTimeout(() => setSolveTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [solveTimer, gameStarted, submitted]);

  const checkCompletion = useCallback((currentGrid: PlacedPiece[]) => {
    for (let pos = 0; pos < 9; pos++) {
      const piece = currentGrid[pos];
      if (!piece || piece.correctPosition !== pos) return false;
    }
    return true;
  }, []);

  const countCorrectPlacements = useCallback((currentGrid: PlacedPiece[]) => {
    let count = 0;
    for (let pos = 0; pos < 9; pos++) {
      const piece = currentGrid[pos];
      if (piece && piece.correctPosition === pos) count++;
    }
    return count;
  }, []);

  const moveToNextImage = useCallback(() => {
    const elapsed = Date.now() - imageStartTime;
    setPerImageTimes(prev => { const n = [...prev]; n[currentImageIdx] = elapsed; return n; });
    const nextIdx = currentImageIdx + 1;
    if (nextIdx < 3) {
      setCurrentImageIdx(nextIdx);
      setImageStartTime(Date.now());
      setupPiecesForImage(nextIdx);
    } else {
      finishGame("completed");
    }
  }, [currentImageIdx, imageStartTime, setupPiecesForImage]);

  const finishGame = (type: ExitType) => {
    if (submitted) return;
    setSubmitted(true);
    const endReason = type === "completed" ? "COMPLETED" : "TIME_UP";
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const allCompleted = type === "completed";

    const finalTimes = [...perImageTimes];
    if (!completedImages[currentImageIdx]) finalTimes[currentImageIdx] = Date.now() - imageStartTime;
    const finalCorrect = [...perImageCorrect];
    finalCorrect[currentImageIdx] = countCorrectPlacements(grid);

    const perImage: PerImageResult[] = images.map((_, i) => ({
      imageIndex: i,
      correctPlacements: allCompleted ? 9 : (i < currentImageIdx ? 9 : (i === currentImageIdx ? finalCorrect[i] : 0)),
      totalPieces: 9,
      swapCount: swapCounts[i],
      moveCount: perImageMoves[i],
      timeTakenMs: finalTimes[i],
    }));

    const totalCorrect = perImage.reduce((s, img) => s + img.correctPlacements, 0);
    const totalSwaps = perImage.reduce((s, img) => s + img.swapCount, 0);
    const imagesCompletedCount = allCompleted ? 3 : completedImages.filter(Boolean).length;
    const score = computePiecesScore(totalCorrect, imagesCompletedCount, 3, totalMoves, timeTaken, totalSwaps, endReason);

    onComplete({
      puzzleType: "match_pieces",
      totalImages: 3,
      imagesCompleted: imagesCompletedCount,
      perImage,
      totalMoves,
      timeTaken,
      endReason,
      score,
    });
  };

  /* ---- Drag & click handlers ---- */
  const handleDragStartScattered = (e: React.DragEvent, piece: PieceType) => {
    setDraggedPiece({ piece, from: "scattered" });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragStartGrid = (e: React.DragEvent, gridPos: number) => {
    const piece = grid[gridPos];
    if (!piece) return;
    setDraggedPiece({ piece, from: gridPos });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDropOnGrid = (e: React.DragEvent, targetPos: number) => {
    e.preventDefault();
    if (!draggedPiece) return;
    doPlace(draggedPiece.piece, draggedPiece.from, targetPos);
    setDraggedPiece(null);
  };

  const handleDropOnScattered = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedPiece) return;
    const { piece, from } = draggedPiece;
    if (typeof from === "number") {
      setGrid(prev => { const n = [...prev]; n[from] = null; return n; });
      setScatteredPieces(prev => [...prev, piece]);
    }
    setDraggedPiece(null);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };
  const handleGridDragEnter = (pos: number) => setDragOverPos(pos);
  const handleGridDragLeave = (e: React.DragEvent) => {
    const related = e.relatedTarget as HTMLElement | null;
    if (!related || !e.currentTarget.contains(related)) setDragOverPos(null);
  };
  const handleGridDrop = (e: React.DragEvent, pos: number) => { setDragOverPos(null); handleDropOnGrid(e, pos); };

  const handleClickScattered = (piece: PieceType) => {
    if (submitted) return;
    setSelectedPiece({ piece, from: "scattered" });
  };

  const handleClickGrid = (pos: number) => {
    if (submitted) return;
    if (selectedPiece) {
      doPlace(selectedPiece.piece, selectedPiece.from, pos);
      setSelectedPiece(null);
    } else if (grid[pos]) {
      setSelectedPiece({ piece: grid[pos]!, from: pos });
    }
  };

  const doPlace = (piece: PieceType, from: "scattered" | number, targetPos: number) => {
    setTotalMoves(m => m + 1);
    setPerImageMoves(prev => { const n = [...prev]; n[currentImageIdx]++; return n; });

    setGrid(prev => {
      const newGrid = [...prev];
      const existingPiece = newGrid[targetPos];

      if (from === "scattered") {
        newGrid[targetPos] = piece;
        setScatteredPieces(sp => {
          const remaining = sp.filter(p => p.id !== piece.id);
          if (existingPiece) return [...remaining, existingPiece];
          return remaining;
        });
      } else {
        const fromPos = from as number;
        newGrid[targetPos] = piece;
        newGrid[fromPos] = existingPiece;
        setSwapCounts(prev => { const n = [...prev]; n[currentImageIdx]++; return n; });
      }

      setTimeout(() => {
        const correct = countCorrectPlacements(newGrid);
        setPerImageCorrect(prev => { const n = [...prev]; n[currentImageIdx] = correct; return n; });

        if (checkCompletion(newGrid)) {
          setCompletedImages(prev => { const n = [...prev]; n[currentImageIdx] = true; return n; });
          setTimeout(() => moveToNextImage(), 800);
        }
      }, 0);

      return newGrid;
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  /* ---- PieceView ---- */
  const PieceView: React.FC<{
    piece: PieceType; size: number; imageSrc: string; isSelected?: boolean; isCorrect?: boolean;
  }> = ({ piece, size, imageSrc, isSelected, isCorrect }) => {
    const bgX = -(piece.correctCol * size);
    const bgY = -(piece.correctRow * size);
    
    // Fallback for image loading
    const [imageError, setImageError] = React.useState(false);
    const fallbackImage = "https://via.placeholder.com/300/06b6d4/ffffff?text=Image";
    
    return (
      <div
        className={`rounded-lg overflow-hidden border-2 transition-all duration-200
          ${isSelected ? "border-cyan-500 ring-2 ring-cyan-300 shadow-lg scale-105" : "border-gray-300"}
          ${isCorrect ? "border-green-500 ring-1 ring-green-300" : ""}`}
        style={{
          width: size, height: size,
          backgroundImage: `url(${imageError ? fallbackImage : imageSrc})`,
          backgroundSize: `${size * 3}px ${size * 3}px`,
          backgroundPosition: `${bgX}px ${bgY}px`,
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Hidden image to detect loading errors */}
        <img
          src={imageSrc}
          alt=""
          className="hidden"
          onError={() => setImageError(true)}
          onLoad={() => setImageError(false)}
        />
        {isCorrect && (
          <div className="w-full h-full flex items-center justify-center bg-green-400/20">
            <CheckCircle2 className="w-4 h-4 text-green-600 drop-shadow" />
          </div>
        )}
      </div>
    );
  };

  if (!gameStarted || images.length === 0) {
    return <div className="text-center py-8 text-gray-500">लोड हो रहा है...</div>;
  }

  const pieceSize = 64;

  return (
    <div className="w-full bg-gradient-to-br from-cyan-50 via-white to-teal-50 rounded-xl p-3 relative">
      {/* Completion Overlay */}
      {submitted && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-xl z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="h-20 w-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <Trophy className="h-10 w-10 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">पहेली पूर्ण! 🎉</h3>
            <p className="text-gray-600 text-sm">आपका स्कोर क्विज़ परिणाम में दिखाया जाएगा</p>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="flex items-center gap-3 mb-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-cyan-500 to-teal-500 text-white">
          <ImageIcon className="h-3.5 w-3.5" />
          चित्र {currentImageIdx + 1} / 3
        </div>
        <div className="flex-1 text-xs text-gray-600 flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-cyan-500 flex-shrink-0" />
          {images[currentImageIdx]?.description}
        </div>
        {/* Image dots */}
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
              ${completedImages[i] ? "bg-green-500 text-white" : i === currentImageIdx ? "bg-cyan-500 text-white animate-pulse" : "bg-gray-200 text-gray-500"}`}>
              {completedImages[i] ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
            </div>
          ))}
        </div>
        {/* Timer */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white ${
          solveTimer <= 30 ? "bg-red-500 animate-pulse" : "bg-cyan-600"
        }`}>
          <Clock className="h-3.5 w-3.5" />
          {formatTime(solveTimer)}
        </div>
      </div>

      {/* Game area */}
      <div className="flex gap-3 min-h-0" style={{ maxHeight: "420px" }}>
        {/* LEFT: Scattered pieces */}
        <div
          className="w-56 bg-white/80 rounded-xl shadow p-2 flex flex-col overflow-hidden"
          onDragOver={handleDragOver}
          onDrop={handleDropOnScattered}
        >
          <h3 className="text-xs font-bold text-gray-800 mb-1 flex items-center gap-1.5">
            <Puzzle className="h-3.5 w-3.5 text-cyan-600" />
            टुकड़े
            <span className="ml-auto bg-cyan-100 text-cyan-700 text-[10px] px-1.5 py-0.5 rounded-full font-semibold">{scatteredPieces.length}</span>
          </h3>
          <div className="flex-1 overflow-y-auto">
            {scatteredPieces.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <CheckCircle2 className="h-6 w-6 mb-1 text-green-400" />
                <p className="text-xs text-center">सभी टुकड़े रख दिए!</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5 p-0.5">
                {scatteredPieces.map(piece => (
                  <div
                    key={piece.id}
                    draggable
                    onDragStart={(e) => handleDragStartScattered(e, piece)}
                    onClick={() => handleClickScattered(piece)}
                    className={`cursor-grab active:cursor-grabbing hover:scale-105 transition-transform
                      ${selectedPiece?.piece.id === piece.id ? "scale-105" : ""}`}
                  >
                    <PieceView piece={piece} size={pieceSize} imageSrc={images[currentImageIdx].src}
                      isSelected={selectedPiece?.piece.id === piece.id} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CENTER: 3x3 Grid */}
        <div className="flex-1 bg-white/80 rounded-xl shadow p-2 flex flex-col overflow-hidden relative">
          <div className="flex items-center justify-between mb-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gradient-to-r from-cyan-500 to-teal-500 text-white">
              <Grid3X3 className="h-3 w-3" /> पहेली ग्रिड
            </div>
            <span className="text-[10px] text-gray-500">{countCorrectPlacements(grid)} / 9 सही</span>
          </div>

          {/* Reference image */}
          <div className="absolute top-2 right-2 z-20 w-24">
            <div className="bg-white/95 rounded-lg shadow-lg border border-cyan-200 p-1">
              <p className="text-[8px] font-bold text-gray-600 flex items-center gap-0.5 mb-0.5 px-0.5">
                <Eye className="h-2.5 w-2.5 text-cyan-600" /> मूल चित्र
              </p>
              <div className="rounded overflow-hidden border border-cyan-100">
                <img src={images[currentImageIdx]?.src} alt="Reference" className="w-full h-auto object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/300/06b6d4/ffffff?text=Image"; }} />
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1.5 rounded-lg">
              {Array.from({ length: 9 }).map((_, pos) => {
                const piece = grid[pos];
                const isCorrectPos = piece ? piece.correctPosition === pos : false;
                const isDragTarget = dragOverPos === pos && draggedPiece !== null;
                return (
                  <div
                    key={pos}
                    onDragOver={handleDragOver}
                    onDragEnter={() => handleGridDragEnter(pos)}
                    onDragLeave={handleGridDragLeave}
                    onDrop={(e) => handleGridDrop(e, pos)}
                    onClick={() => handleClickGrid(pos)}
                    className={`rounded-lg flex items-center justify-center transition-all duration-150 relative
                      ${!piece ? "border-2 border-dashed border-gray-300 bg-gray-50 hover:border-cyan-400" : ""}
                      ${isDragTarget && !piece ? "!border-cyan-500 !bg-cyan-100/70 ring-2 ring-cyan-400 scale-105" : ""}
                      ${isDragTarget && piece ? "ring-2 ring-amber-400 scale-105" : ""}
                      ${selectedPiece && typeof selectedPiece.from === "number" && selectedPiece.from === pos ? "ring-2 ring-cyan-400" : ""}`}
                    style={{ width: pieceSize + 4, height: pieceSize + 4 }}
                  >
                    {piece ? (
                      <div
                        draggable
                        onDragStart={(e) => handleDragStartGrid(e, pos)}
                        className="cursor-grab active:cursor-grabbing"
                      >
                        <PieceView piece={piece} size={pieceSize} imageSrc={images[currentImageIdx].src}
                          isSelected={selectedPiece?.from === pos} isCorrect={isCorrectPos} />
                      </div>
                    ) : (
                      <span className="text-gray-300 text-sm font-bold">{pos + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmbeddableMatchPieces;
