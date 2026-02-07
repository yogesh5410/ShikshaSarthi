import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Clock, Trophy, Target, Zap, X, Play, BookOpen } from "lucide-react";
import { getMemoryImages } from "./imageUtils";

const API_URL = import.meta.env.VITE_API_URL;

type CardType = {
  id: number;
  image: string;
  matched: boolean;
  index: number;
};

type ExitType = "completed" | "exited" | "time_up" | null;
type GameScreen = "intro" | "mode-select" | "game" | "results";

const PREVIEW_TIME = 15;   // seconds
const SOLVE_TIME = 180;   // 3 minutes

const MemoryMatchGrid: React.FC = () => {
  const [screen, setScreen] = useState<GameScreen>("intro");
  const [mode, setMode] = useState<"individual" | "group" | null>(null);
  const [cards, setCards] = useState<CardType[]>([]);
  const [flipped, setFlipped] = useState<CardType[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);

  // timers
  const [previewTimer, setPreviewTimer] = useState(PREVIEW_TIME);
  const [solveTimer, setSolveTimer] = useState(SOLVE_TIME);
  const [previewPhase, setPreviewPhase] = useState(true);

  // metrics
  const [totalClicks, setTotalClicks] = useState(0);
  const [incorrectClicks, setIncorrectClicks] = useState(0);
  const [nearbyClicks, setNearbyClicks] = useState(0);
  const [exitType, setExitType] = useState<ExitType>(null);

  const [analysis, setAnalysis] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);

  const pairCount = mode === "individual" ? 10 : 15; // 20 or 30 cards
  const gridCols = mode === "individual" ? 5 : 6; // 5x4 or 6x5
  const gridRows = mode === "individual" ? 4 : 5; // 4 rows or 5 rows

  /* ---------------- START GAME ---------------- */
  const startGame = (selectedMode: "individual" | "group") => {
    setMode(selectedMode);
    setScreen("game");
    setCards([]);
    setFlipped([]);
    setMoves(0);
    setMatches(0);
    setTotalClicks(0);
    setIncorrectClicks(0);
    setNearbyClicks(0);
    setExitType(null);
    setAnalysis(null);
    setSubmitted(false);

    setPreviewPhase(true);
    setPreviewTimer(PREVIEW_TIME);
    setSolveTimer(SOLVE_TIME);
    setStartTime(Date.now());

    // Get images from utility function
    const allImages = getMemoryImages();
    const pairsNeeded = selectedMode === "individual" ? 10 : 15;
    const images = allImages.slice(0, pairsNeeded);
    
    const shuffled = [...images, ...images]
      .map((img, i) => ({
        id: i,
        image: img,
        matched: false,
        index: i,
      }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffled);
  };

  /* ---------------- PREVIEW TIMER ---------------- */
  useEffect(() => {
    if (!mode || !previewPhase) return;

    if (previewTimer === 0) {
      setPreviewPhase(false);
      return;
    }

    const t = setTimeout(() => setPreviewTimer(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [previewTimer, previewPhase, mode]);

  /* ---------------- SOLVE TIMER ---------------- */
  useEffect(() => {
    if (!mode || previewPhase || analysis) return;

    if (solveTimer === 0) {
      handleSubmit("time_up");
      return;
    }

    const t = setTimeout(() => setSolveTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [solveTimer, previewPhase, mode]);

  /* ---------------- HANDLE FLIP ---------------- */
  const handleFlip = (card: CardType) => {
    if (
      previewPhase ||
      flipped.length === 2 ||
      card.matched ||
      flipped.includes(card)
    )
      return;

    setTotalClicks(c => c + 1);
    const newFlipped = [...flipped, card];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);

      if (newFlipped[0].image === newFlipped[1].image) {
        setCards(prev =>
          prev.map(c =>
            c.image === card.image ? { ...c, matched: true } : c
          )
        );
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

  /* ---------------- AUTO COMPLETE ---------------- */
  useEffect(() => {
    if (mode && matches === pairCount && !submitted) {
      handleSubmit("completed");
    }
  }, [matches]);

  /* ---------------- SUBMIT RESULT ---------------- */
  const handleSubmit = async (type: ExitType) => {
    if (submitted) return;
    setSubmitted(true);
    setExitType(type);

    const endReason =
      type === "completed"
        ? "COMPLETED"
        : type === "exited"
        ? "EXITED"
        : "TIME_UP";

    try {
      const res = await axios.post(`${API_URL}/puzzles/evaluate`, {
        mode,
        totalPairs: pairCount,
        totalClicks,
        incorrectClicks,
        nearbyClicks,
        correctPairs: matches,
        timeTaken: Math.floor((Date.now() - startTime) / 1000),
        endReason,
      });

      setAnalysis(res.data);
      setScreen("results");
    } catch (error) {
      console.error("Evaluation error:", error);
      alert("Failed to evaluate game. Please try again.");
      setSubmitted(false);
    }
  };

  /* ---------------- EXIT BUTTON ---------------- */
  const handleExit = () => handleSubmit("exited");

  /* ---------------- RESET GAME ---------------- */
  const handleReset = () => {
    setScreen("intro");
    setMode(null);
    setCards([]);
    setFlipped([]);
    setMoves(0);
    setMatches(0);
    setTotalClicks(0);
    setIncorrectClicks(0);
    setNearbyClicks(0);
    setExitType(null);
    setAnalysis(null);
    setSubmitted(false);
  };

  /* ---------------- TIMER DISPLAY ---------------- */
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimerColor = () => {
    if (previewPhase) return "text-blue-600";
    if (solveTimer <= 30) return "text-red-600";
    if (solveTimer <= 60) return "text-orange-500";
    return "text-green-600";
  };

  /* ===================== UI ===================== */
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Header />
      
      <div className="flex-1 overflow-hidden flex items-center justify-center">
      
        {/* INTRO SCREEN */}
        {screen === "intro" && (
          <div className="max-w-3xl mx-auto px-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-12 text-center">
            {/* <div className="inline-block p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-6">
              <BookOpen className="w-16 h-16 text-white" />
            </div> */}
            
            <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Memory Match Challenge
            </h1>
            
            <div className="text-left space-y-4 mb-8 text-gray-700">
              <p className="text-lg">
                <span className="font-semibold text-indigo-600">🎯 Objective:</span> Match all pairs of cards before time runs out!
              </p>
              
              <div className="bg-indigo-50 rounded-xl p-4 space-y-2">
                <p className="font-semibold text-indigo-700">📋 How to Play:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Preview Phase:</strong> Memorize card positions (15 seconds)</li>
                  <li><strong>Game Phase:</strong> Match all pairs within 3 minutes</li>
                  <li><strong>Click cards</strong> to flip and find matching pairs</li>
                  <li><strong>Track your performance:</strong> Moves, matches, and time</li>
                </ul>
              </div>
              
              <div className="flex gap-4 mt-6">
                <div className="flex-1 bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-sm text-gray-600">Individual Mode</p>
                  <p className="text-2xl font-bold text-blue-600">20 Cards</p>
                  <p className="text-xs text-gray-500">10 pairs to match</p>
                </div>
                <div className="flex-1 bg-purple-50 rounded-xl p-3 text-center">
                  <p className="text-sm text-gray-600">Group Mode</p>
                  <p className="text-2xl font-bold text-purple-600">30 Cards</p>
                  <p className="text-xs text-gray-500">15 pairs to match</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setScreen("mode-select")}
              className="px-12 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-3 mx-auto"
            >
              <Play className="w-4 h-4" />
              Start Game
            </button>
          </div>
        </div>
      )}

        {/* MODE SELECTION SCREEN */}
        {screen === "mode-select" && (
          <div className="max-w-4xl mx-auto px-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Choose Your Mode
            </h2>
            
            <div className="grid grid-cols-2 gap-8">
              <button
                onClick={() => startGame("individual")}
                className="group relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold mb-3">Individual Mode</h3>
                <div className="bg-white/20 rounded-lg p-4 mb-4">
                  <p className="text-2xl font-bold">20 Cards</p>
                  <p className="text-sm opacity-90">10 pairs to match</p>
                </div>
                <p className="text-sm opacity-90">Perfect for focused practice</p>
              </button>

              <button
                onClick={() => startGame("group")}
                className="group relative bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-2xl font-bold mb-3">Group Mode</h3>
                <div className="bg-white/20 rounded-lg p-4 mb-4">
                  <p className="text-2xl font-bold">30 Cards</p>
                  <p className="text-sm opacity-90">15 pairs to match</p>
                </div>
                <p className="text-sm opacity-90">Complete the challenge with your friends</p>
              </button>
            </div>

            <button
              onClick={() => setScreen("intro")}
              className="mt-8 px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
      )}

        {/* GAME SCREEN */}
        {screen === "game" && mode && (
          <div className="w-full h-full flex items-center justify-center py-4 px-6">
            <div className="flex gap-5 max-w-7xl w-full" style={{ height: 'calc(100vh - 200px)', maxHeight: '800px' }}>
            
              {/* LEFT: Cards Grid */}
              <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 flex flex-col overflow-hidden">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className={`px-4 py-2 rounded-lg ${previewPhase ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                    <p className="text-sm font-semibold">
                      {previewPhase ? "🧠 Memorize the Positions!" : "🎯 Find the Matches!"}
                    </p>
                  </div>
                </div>
                
                <div className="flex-1 flex items-center justify-center p-2">
                  <div 
                    className="grid gap-3"
                    style={{ 
                      gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                      gridTemplateRows: `repeat(${gridRows}, 1fr)`,
                      width: 'fit-content',
                      height: 'fit-content',
                      maxWidth: '100%',
                      maxHeight: '100%'
                    }}
                  >
                    {cards.map(card => {
                      const visible = previewPhase || flipped.includes(card) || card.matched;
                      const cardSize = mode === "individual" ? 'w-24 h-24' : 'w-20 h-20';

                      return (
                        <div
                          key={card.id}
                          onClick={() => handleFlip(card)}
                          className={`${cardSize} relative cursor-pointer transform transition-all duration-200 rounded-xl overflow-hidden shadow-md
                            ${!visible && !card.matched ? 'hover:scale-105 hover:shadow-xl active:scale-95' : ''}
                            ${card.matched ? 'opacity-60 scale-95' : ''}`}
                        >
                          <div className={`w-full h-full ${ 
                            visible 
                              ? 'bg-white border-2 border-indigo-300' 
                              : 'bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700'
                          }`}>
                            {visible ? (
                              <img 
                                src={card.image} 
                                alt="card" 
                                className="w-full h-full object-cover p-1"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `https://via.placeholder.com/150/6366f1/ffffff?text=${card.index + 1}`;
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-white text-4xl font-bold drop-shadow-lg">?</span>
                              </div>
                            )}
                          </div>
                          {card.matched && (
                            <div className="absolute inset-0 flex items-center justify-center bg-green-400/50 backdrop-blur-[2px]">
                              <div className="bg-white rounded-full p-2 shadow-lg">
                                <Trophy className="w-6 h-6 text-green-600" />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RIGHT: Stats Panel */}
              <div className="w-80 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 flex flex-col gap-4">
                <h3 className="text-xl font-bold text-center text-gray-800">Game Stats</h3>
                
                {/* Timer - Large Display */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-center shadow-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className={`w-7 h-7 text-white ${!previewPhase && solveTimer <= 30 ? 'animate-pulse' : ''}`} />
                    <span className="text-white text-base font-semibold">
                      {previewPhase ? "Memorize" : "Time Left"}
                    </span>
                  </div>
                  <div className={`text-5xl font-bold text-white`}>
                    {previewPhase ? formatTime(previewTimer) : formatTime(solveTimer)}
                  </div>
                </div>

                {/* Matches */}
                <div className="bg-green-50 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                  <div className="bg-green-500 rounded-lg p-3">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 font-medium">Matches</p>
                    <p className="text-2xl font-bold text-green-600">{matches} / {pairCount}</p>
                  </div>
                </div>

                {/* Moves */}
                <div className="bg-purple-50 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                  <div className="bg-purple-500 rounded-lg p-3">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 font-medium">Moves</p>
                    <p className="text-2xl font-bold text-purple-600">{moves}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-gray-600 font-medium mb-2">Progress</p>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 rounded-full"
                      style={{ width: `${(matches / pairCount) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {Math.round((matches / pairCount) * 100)}% Complete
                  </p>
                </div>

                {/* Spacer */}
                <div className="flex-1"></div>

                {/* Exit Button */}
                <button
                  onClick={handleExit}
                  className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition-all hover:shadow-lg flex items-center justify-center gap-2 shadow-md"
                >
                  <X className="w-5 h-5" />
                  Exit Game
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RESULTS SCREEN */}
        {screen === "results" && analysis && (
          <div className="w-full h-full flex items-center justify-center py-4 px-6">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-5xl w-full" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              <div className="flex gap-8 h-full overflow-y-auto">
                
              {/* LEFT: Score Display */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="inline-block p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-4">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="text-3xl font-bold text-gray-800 mb-3">
                  Assessment Complete!
                </h2>

                {/* Score Circle */}
                <div className="relative w-44 h-44 mb-6">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="88" cy="88" r="80" stroke="#e5e7eb" strokeWidth="14" fill="none" />
                    <circle 
                      cx="88" cy="88" r="80" 
                      stroke="url(#gradient)" 
                      strokeWidth="14" 
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 80}`}
                      strokeDashoffset={`${2 * Math.PI * 80 * (1 - analysis.score / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold text-gray-800">{analysis.score}</span>
                    <span className="text-base text-gray-600">/ 100</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 w-full text-center mb-3">
                  <p className="text-xs text-gray-600 mb-1">Memory Level</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {analysis.memoryLevel}
                  </p>
                </div>

                <p className="text-gray-600 text-sm text-center mb-2 px-2">{analysis.feedback}</p>
                <p className="text-xs text-gray-500 text-center">Game ended: {analysis.endReason}</p>
              </div>

              {/* RIGHT: Performance Breakdown */}
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="text-xl font-bold text-gray-800 mb-5">Performance Breakdown</h3>
                
                {analysis.breakdown && (
                  <div className="space-y-4">
                    {/* Accuracy */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-gray-700">Accuracy</span>
                        <span className="font-bold text-blue-600">{(analysis.breakdown.accuracy * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${analysis.breakdown.accuracy * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Efficiency */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-gray-700">Efficiency</span>
                        <span className="font-bold text-green-600">{(analysis.breakdown.efficiency * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="h-full bg-green-500 rounded-full transition-all"
                          style={{ width: `${analysis.breakdown.efficiency * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Speed */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-gray-700">Speed</span>
                        <span className="font-bold text-purple-600">{(analysis.breakdown.speed * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="h-full bg-purple-500 rounded-full transition-all"
                          style={{ width: `${analysis.breakdown.speed * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Control */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-gray-700">Control</span>
                        <span className="font-bold text-orange-600">{(analysis.breakdown.control * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="h-full bg-orange-500 rounded-full transition-all"
                          style={{ width: `${analysis.breakdown.control * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <button
                    onClick={() => setScreen("mode-select")}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all"
                  >
                    Play Again
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    Main Menu
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
      
    </div>
  );
};

export default MemoryMatchGrid;