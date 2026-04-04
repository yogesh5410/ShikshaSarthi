import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Trophy,
  BookOpen,
  Dices,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Play,
  Star,
  AlertTriangle,
  Zap,
  Info,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

type SquareType = "normal" | "ladder-foot" | "ladder-top" | "snake-head" | "snake-tail" | "question";
type GamePhase = "intro" | "playing" | "question" | "result-feedback" | "won";

interface SpecialSquare {
  type: SquareType;
  connects?: number; // destination for ladder/snake
  label?: string;
}

// ─── Questions Bank ───────────────────────────────────────────────────────────

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: "Pi Day (π दिवस) किस तारीख को मनाया जाता है?",
    options: ["14 मार्च", "22 जुलाई", "28 फरवरी", "15 अप्रैल"],
    correct: 0,
    explanation: "π ≈ 3.14 होने के कारण Pi Day 14 मार्च (3/14) को मनाया जाता है।",
  },
  {
    id: 2,
    question: "समान्तर चतुर्भुज (Parallelogram) का क्षेत्रफल क्या होता है?",
    options: ["आधार × ऊँचाई", "½ × आधार × ऊँचाई", "भुजा²", "π × r²"],
    correct: 0,
    explanation: "समान्तर चतुर्भुज का क्षेत्रफल = आधार × ऊँचाई (Base × Height)",
  },
  {
    id: 3,
    question: "P=₹50,000, R=8% प्रतिवर्ष, T=2 वर्ष। साधारण ब्याज (SI) कितना होगा?",
    options: ["₹8,000", "₹6,500", "₹10,000", "₹7,200"],
    correct: 0,
    explanation: "SI = P×R×T/100 = 50000×8×2/100 = ₹8,000",
  },
  {
    id: 4,
    question: "√144 का मान क्या है?",
    options: ["12", "14", "11", "13"],
    correct: 0,
    explanation: "12 × 12 = 144, अतः √144 = 12",
  },
  {
    id: 5,
    question: "बेयज़ प्रमेय (Bayes' Theorem) का सूत्र क्या है?",
    options: [
      "P(A|B) = P(B|A)·P(A) / P(B)",
      "P(A|B) = P(A) + P(B)",
      "P(A∩B) = P(A) · P(B)",
      "P(A|B) = P(A) / P(B)",
    ],
    correct: 0,
    explanation: "बेयज़ प्रमेय: P(A|B) = [P(B|A) × P(A)] / P(B)",
  },
  {
    id: 6,
    question: "π (Pi) का लगभग मान क्या है?",
    options: ["3.14159", "2.71828", "1.61803", "1.41421"],
    correct: 0,
    explanation: "π ≈ 3.14159 — यह एक अपरिमेय संख्या है।",
  },
  {
    id: 7,
    question: "एक गैर-लीप वर्ष (Non-leap year) में ठीक 53 रविवार होने की प्रायिकता क्या है?",
    options: ["1/7", "2/7", "3/7", "1/4"],
    correct: 0,
    explanation: "गैर-लीप वर्ष में 365 दिन = 52 सप्ताह + 1 अतिरिक्त दिन। वह 1 दिन रविवार होने की P = 1/7",
  },
  {
    id: 8,
    question: "द्विघात समीकरण x² – 5x + 6 = 0 के मूलों का योग क्या होगा?",
    options: ["5", "6", "-5", "-6"],
    correct: 0,
    explanation: "ax² + bx + c = 0 में मूलों का योग = -b/a = -(-5)/1 = 5",
  },
  {
    id: 9,
    question: "3 मुर्गियाँ 3 दिन में 3 अंडे देती हैं। 12 मुर्गियाँ 12 दिन में कितने अंडे देंगी?",
    options: ["48", "36", "12", "24"],
    correct: 0,
    explanation: "1 मुर्गी 3 दिन में 1 अंडा देती है, अतः 12 मुर्गियाँ 12 दिन में = 12 × 4 = 48 अंडे",
  },
  {
    id: 10,
    question: "दो संख्याओं का योग 25 है और अंतर 13 है। उनका गुणनफल क्या होगा?",
    options: ["114", "112", "116", "120"],
    correct: 0,
    explanation: "a+b=25, a-b=13 → a=19, b=6 → गुणनफल = 19×6 = 114",
  },
  {
    id: 11,
    question: "चक्रवृद्धि ब्याज (Compound Interest) का सूत्र क्या है?",
    options: [
      "A = P(1 + R/100)ⁿ",
      "SI = P×R×T/100",
      "A = P + P×R×T",
      "CI = P×R/100",
    ],
    correct: 0,
    explanation: "CI सूत्र: A = P(1 + R/100)ⁿ, जहाँ n वर्षों की संख्या है।",
  },
  {
    id: 12,
    question: "यदि कोई वस्तु ₹500 में खरीदी और 15% लाभ पर बेची जाए, तो विक्रय मूल्य क्या होगा?",
    options: ["₹575", "₹550", "₹600", "₹525"],
    correct: 0,
    explanation: "विक्रय मूल्य = CP × (1 + Profit%/100) = 500 × 1.15 = ₹575",
  },
  {
    id: 13,
    question: "त्रिभुज की सर्वांगसमता (Congruence) की शर्त SSS का अर्थ क्या है?",
    options: [
      "तीनों भुजाएँ बराबर हों",
      "दो भुजाएँ और एक कोण बराबर हो",
      "दो कोण और एक भुजा बराबर हो",
      "तीनों कोण बराबर हों",
    ],
    correct: 0,
    explanation: "SSS (Side-Side-Side): यदि दोनों त्रिभुजों की तीनों भुजाएँ बराबर हों तो वे सर्वांगसम हैं।",
  },
  {
    id: 14,
    question: "यदि किसी घन (Cube) की भुजा 4 cm है, तो उसका आयतन कितना होगा?",
    options: ["64 cm³", "48 cm³", "32 cm³", "96 cm³"],
    correct: 0,
    explanation: "घन का आयतन = भुजा³ = 4³ = 64 cm³",
  },
  {
    id: 15,
    question: "LCM(12, 18) का मान क्या है?",
    options: ["36", "72", "24", "54"],
    correct: 0,
    explanation: "12 = 2²×3, 18 = 2×3². LCM = 2²×3² = 36",
  },
  {
    id: 16,
    question: "रैखिक समीकरण 2x + 3 = 11 में x का मान क्या है?",
    options: ["4", "3", "5", "2"],
    correct: 0,
    explanation: "2x = 11 - 3 = 8, अतः x = 4",
  },
  {
    id: 17,
    question: "1 से 20 तक की सम संख्याओं का योग क्या है?",
    options: ["110", "100", "90", "120"],
    correct: 0,
    explanation: "2+4+6+…+20 = 2(1+2+…+10) = 2×55 = 110",
  },
  {
    id: 18,
    question: "यदि किसी वृत्त की त्रिज्या 7 cm है, तो उसका क्षेत्रफल क्या होगा? (π = 22/7)",
    options: ["154 cm²", "44 cm²", "78 cm²", "132 cm²"],
    correct: 0,
    explanation: "क्षेत्रफल = πr² = (22/7) × 7² = 22 × 7 = 154 cm²",
  },
  {
    id: 19,
    question: "पाइथागोरस प्रमेय के अनुसार, कर्ण (Hypotenuse) का सूत्र क्या है?",
    options: ["c² = a² + b²", "c = a + b", "c² = a² - b²", "c = a² + b²"],
    correct: 0,
    explanation: "पाइथागोरस: c² = a² + b², जहाँ c कर्ण और a, b अन्य दो भुजाएँ हैं।",
  },
  {
    id: 20,
    question: "100 का 15% कितना होगा?",
    options: ["15", "10", "20", "12"],
    correct: 0,
    explanation: "15% of 100 = (15/100) × 100 = 15",
  },
];

// ─── Board Configuration ──────────────────────────────────────────────────────

// Ladders: { footSquare: topSquare }
const LADDERS: Record<number, number> = {
  4: 14,
  9: 31,
  20: 38,
  28: 84,
  40: 59,
  51: 67,
  63: 81,
  71: 91,
};

// Snakes: { headSquare: tailSquare }
const SNAKES: Record<number, number> = {
  17: 7,
  54: 34,
  62: 19,
  64: 60,
  87: 24,
  93: 73,
  95: 75,
  99: 78,
};

// Standalone question boxes (no snake or ladder)
const QUESTION_BOXES = new Set([15, 25, 35, 45, 55, 65, 70, 80, 90]);

// Build special squares map
const buildSpecialSquares = (): Record<number, SpecialSquare> => {
  const map: Record<number, SpecialSquare> = {};

  Object.entries(LADDERS).forEach(([from, to]) => {
    map[Number(from)] = { type: "ladder-foot", connects: Number(to), label: `🪜 →${to}` };
    map[Number(to)] = { type: "ladder-top" };
  });

  Object.entries(SNAKES).forEach(([from, to]) => {
    map[Number(from)] = { type: "snake-head", connects: Number(to), label: `🐍 →${to}` };
    map[Number(to)] = { type: "snake-tail" };
  });

  QUESTION_BOXES.forEach((sq) => {
    if (!map[sq]) {
      map[sq] = { type: "question", label: "❓" };
    }
  });

  return map;
};

const SPECIAL_SQUARES = buildSpecialSquares();

// ─── Board Cell Position ──────────────────────────────────────────────────────

const getCellPos = (num: number): { row: number; col: number } => {
  const n = num - 1;
  const row = Math.floor(n / 10); // 0 = bottom row
  const col = row % 2 === 0 ? n % 10 : 9 - (n % 10);
  return { row, col }; // row 0 = bottom, col 0 = left
};

// ─── Dice Component ───────────────────────────────────────────────────────────

const DiceFace: React.FC<{ value: number; rolling: boolean }> = ({ value, rolling }) => {
  const dots = [
    [],
    [[50, 50]],
    [[25, 25], [75, 75]],
    [[25, 25], [50, 50], [75, 75]],
    [[25, 25], [75, 25], [25, 75], [75, 75]],
    [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
    [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
  ];

  return (
    <div
      className={`w-16 h-16 bg-white border-2 border-gray-300 rounded-xl shadow-lg flex items-center justify-center relative ${
        rolling ? "animate-spin" : ""
      }`}
    >
      <svg width="64" height="64" viewBox="0 0 100 100">
        {dots[value]?.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="9" fill="#1e293b" />
        ))}
      </svg>
    </div>
  );
};

// ─── Board Cell ───────────────────────────────────────────────────────────────

const cellColors: Record<SquareType, string> = {
  normal: "bg-white",
  "ladder-foot": "bg-green-100 border-green-400",
  "ladder-top": "bg-green-200 border-green-500",
  "snake-head": "bg-red-200 border-red-400",
  "snake-tail": "bg-red-100 border-red-300",
  question: "bg-amber-100 border-amber-400",
};

interface BoardCellProps {
  num: number;
  isPlayer: boolean;
  special?: SpecialSquare;
}

const BoardCell: React.FC<BoardCellProps> = ({ num, isPlayer, special }) => {
  const type = special?.type ?? "normal";
  const base = cellColors[type];

  return (
    <div
      className={`
        relative flex flex-col items-center justify-center
        border text-xs font-semibold select-none
        ${base}
        ${isPlayer ? "ring-2 ring-blue-500 z-10 scale-105" : ""}
        transition-all duration-200
      `}
      style={{ aspectRatio: "1" }}
    >
      <span className="text-[10px] text-gray-500 leading-none">{num}</span>
      {isPlayer && (
        <span className="text-base leading-none" title="आपकी स्थिति">
          🎯
        </span>
      )}
      {!isPlayer && special?.label && (
        <span className="text-[9px] leading-none text-center">{special.label}</span>
      )}
    </div>
  );
};

// ─── Main Game Component ──────────────────────────────────────────────────────

const GyanKiYatra: React.FC = () => {
  const navigate = useNavigate();

  // Game state
  const [phase, setPhase] = useState<GamePhase>("intro");
  const [position, setPosition] = useState(0); // 0 = start (not on board yet)
  const [diceValue, setDiceValue] = useState<number>(1);
  const [rolling, setRolling] = useState(false);
  const [canRoll, setCanRoll] = useState(true);
  const [skipTurns, setSkipTurns] = useState(0);

  // Question state
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [questionContext, setQuestionContext] = useState<"ladder" | "snake" | "question" | null>(null);
  const [landedSquare, setLandedSquare] = useState<number>(0);

  // Score / log
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  // Question pool tracking (avoid repeats)
  const [usedQIds, setUsedQIds] = useState<Set<number>>(new Set());

  const addLog = useCallback((msg: string) => {
    setLog((prev) => [msg, ...prev].slice(0, 6));
  }, []);

  const pickQuestion = useCallback((): Question => {
    const available = QUESTIONS.filter((q) => !usedQIds.has(q.id));
    const pool = available.length > 0 ? available : QUESTIONS;
    const q = pool[Math.floor(Math.random() * pool.length)];
    setUsedQIds((prev) => new Set([...prev, q.id]));
    return q;
  }, [usedQIds]);

  // ── Roll dice ──────────────────────────────────────────────────────────────
  const rollDice = useCallback(() => {
    if (!canRoll || rolling || phase !== "playing") return;

    if (skipTurns > 0) {
      setSkipTurns((s) => s - 1);
      addLog(`⏭️ आपकी बारी छोड़ी गई। (${skipTurns - 1} बारी और छूटेगी)`);
      return;
    }

    setRolling(true);
    setCanRoll(false);

    const roll = Math.ceil(Math.random() * 6);

    // Animate rolling: show random values for 600ms then settle
    let count = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.ceil(Math.random() * 6));
      count++;
      if (count >= 8) {
        clearInterval(interval);
        setDiceValue(roll);
        setRolling(false);
        processMove(roll);
      }
    }, 80);
  }, [canRoll, rolling, phase, skipTurns, position]);

  const processMove = useCallback(
    (roll: number) => {
      const newPos = position + roll;

      if (newPos > 100) {
        // Can't move beyond 100
        addLog(`🎲 पासा: ${roll} — आगे नहीं बढ़ सकते (100 से आगे)`);
        setMoves((m) => m + 1);
        setCanRoll(true);
        return;
      }

      setMoves((m) => m + 1);
      setPosition(newPos);
      addLog(`🎲 पासा: ${roll} → घर ${newPos} पर पहुँचे`);

      if (newPos === 100) {
        setPhase("won");
        return;
      }

      const special = SPECIAL_SQUARES[newPos];
      if (special) {
        if (special.type === "ladder-foot") {
          setLandedSquare(newPos);
          setCurrentQuestion(pickQuestion());
          setQuestionContext("ladder");
          setSelectedOption(null);
          setPhase("question");
        } else if (special.type === "snake-head") {
          setLandedSquare(newPos);
          setCurrentQuestion(pickQuestion());
          setQuestionContext("snake");
          setSelectedOption(null);
          setPhase("question");
        } else if (special.type === "question") {
          setLandedSquare(newPos);
          setCurrentQuestion(pickQuestion());
          setQuestionContext("question");
          setSelectedOption(null);
          setPhase("question");
        } else {
          setCanRoll(true);
        }
      } else {
        setCanRoll(true);
      }
    },
    [position, pickQuestion, addLog]
  );

  // ── Answer a question ──────────────────────────────────────────────────────
  const handleAnswer = useCallback(
    (idx: number) => {
      if (selectedOption !== null || !currentQuestion) return;
      setSelectedOption(idx);

      const isCorrect = idx === currentQuestion.correct;

      if (isCorrect) {
        setScore((s) => s + 10);
      }

      if (questionContext === "ladder") {
        const dest = SPECIAL_SQUARES[landedSquare]?.connects ?? landedSquare;
        if (isCorrect) {
          setPosition(dest);
          addLog(`✅ सही! सीढ़ी चढ़ गए → घर ${dest}`);
          if (dest === 100) {
            setTimeout(() => setPhase("won"), 1200);
            return;
          }
        } else {
          addLog(`❌ गलत! सीढ़ी के नीचे रहे → घर ${landedSquare}`);
        }
      } else if (questionContext === "snake") {
        if (isCorrect) {
          addLog(`✅ सही! साँप से बच गए → घर ${landedSquare} पर रहे`);
        } else {
          const dest = SPECIAL_SQUARES[landedSquare]?.connects ?? landedSquare;
          setPosition(dest);
          addLog(`❌ गलत! साँप ने काटा → घर ${dest} पर गए`);
        }
      } else {
        // Question box
        if (isCorrect) {
          const bonus = 2;
          const newPos = Math.min(position + bonus, 100);
          setPosition(newPos);
          addLog(`✅ सही! +${bonus} कदम आगे → घर ${newPos}`);
          if (newPos === 100) {
            setTimeout(() => setPhase("won"), 1200);
            return;
          }
        } else {
          const penalty = 2;
          const newPos = Math.max(position - penalty, 1);
          setPosition(newPos);
          setSkipTurns(1);
          addLog(`❌ गलत! -${penalty} कदम पीछे और अगली बारी छूटेगी → घर ${newPos}`);
        }
      }

      setPhase("result-feedback");
    },
    [selectedOption, currentQuestion, questionContext, landedSquare, position, addLog]
  );

  const dismissFeedback = useCallback(() => {
    setPhase("playing");
    setCurrentQuestion(null);
    setSelectedOption(null);
    setQuestionContext(null);
    setCanRoll(true);
  }, []);

  const resetGame = useCallback(() => {
    setPhase("playing");
    setPosition(0);
    setDiceValue(1);
    setRolling(false);
    setCanRoll(true);
    setSkipTurns(0);
    setCurrentQuestion(null);
    setSelectedOption(null);
    setQuestionContext(null);
    setLandedSquare(0);
    setScore(0);
    setMoves(0);
    setLog([]);
    setUsedQIds(new Set());
  }, []);

  // ── Build board rows (top to bottom visually) ──────────────────────────────
  const boardRows: number[][] = [];
  for (let row = 9; row >= 0; row--) {
    const cells: number[] = [];
    for (let col = 0; col < 10; col++) {
      const visualCol = row % 2 === 0 ? col : 9 - col;
      const num = row * 10 + visualCol + 1;
      cells.push(num);
    }
    boardRows.push(cells);
  }

  // ── Legend data ────────────────────────────────────────────────────────────
  const legend = [
    { color: "bg-green-200 border-green-500", label: "सीढ़ी (Ladder) — ऊपर जाएं" },
    { color: "bg-red-200 border-red-400", label: "साँप (Snake) — नीचे जाएं" },
    { color: "bg-amber-100 border-amber-400", label: "प्रश्न बॉक्स (Question Box)" },
    { color: "bg-blue-100 border-blue-500 ring-2 ring-blue-500", label: "🎯 आपकी वर्तमान स्थिति" },
  ];

  // ─── INTRO SCREEN ─────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <Header />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4 max-w-2xl">
            <Button
              variant="ghost"
              className="mb-6"
              onClick={() => navigate("/student/multimedia/puzzles")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              पहेली गेम्स पर वापस जाएं
            </Button>

            {/* Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg mb-4">
                <span className="text-4xl">🎲</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-1">ज्ञान की यात्रा</h1>
              <p className="text-lg text-orange-600 font-semibold">Gyan Ki Yatra</p>
              <p className="text-gray-500 mt-2">
                साँप-सीढ़ी के साथ शैक्षिक प्रश्नों का रोमांचक खेल
              </p>
            </div>

            {/* Rules */}
            <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6 mb-6 space-y-4">
              <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-orange-500" />
                नियम (Rules)
              </h2>
              <div className="grid grid-cols-1 gap-3 text-sm text-gray-700">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                  <span className="text-2xl">🪜</span>
                  <div>
                    <p className="font-semibold text-green-700">सीढ़ी के खाने पर</p>
                    <p>सही उत्तर दें → सीढ़ी चढ़ें | गलत → उसी खाने पर रहें</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl">
                  <span className="text-2xl">🐍</span>
                  <div>
                    <p className="font-semibold text-red-700">साँप के सिर वाले खाने पर</p>
                    <p>सही उत्तर दें → साँप से बचें | गलत → साँप की पूँछ पर जाएं</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                  <span className="text-2xl">❓</span>
                  <div>
                    <p className="font-semibold text-amber-700">प्रश्न बॉक्स पर</p>
                    <p>सही उत्तर दें → +2 आगे बढ़ें | गलत → -2 पीछे जाएं और 1 बारी छोड़ें</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <p className="font-semibold text-blue-700">लक्ष्य</p>
                    <p>पासा फेंककर खाना 100 तक पहुँचें और ज्ञान की यात्रा पूरी करें!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Scoring */}
            <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4 mb-8">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />
                स्कोरिंग
              </h3>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>सही उत्तर = +10 अंक</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span>गलत उत्तर = 0 अंक</span>
                </div>
              </div>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-lg py-6 rounded-xl shadow-lg"
              onClick={() => setPhase("playing")}
            >
              <Play className="h-5 w-5 mr-2" />
              खेल शुरू करें — Roll the Dice!
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ─── WON SCREEN ───────────────────────────────────────────────────────────
  if (phase === "won") {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
        <Header />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4 max-w-lg text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-xl mb-4">
                <Trophy className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">🎉 बधाई हो!</h1>
              <p className="text-xl text-orange-600 font-semibold">ज्ञान की यात्रा पूरी हुई!</p>
            </div>

            <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-6 mb-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-3xl font-bold text-amber-600">{score}</p>
                  <p className="text-sm text-gray-600">कुल अंक</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-3xl font-bold text-blue-600">{moves}</p>
                  <p className="text-sm text-gray-600">कुल चालें</p>
                </div>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-lg font-semibold text-green-700">
                  🏆 आपने {score} अंक के साथ खेल जीता!
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  आपने {moves} चालों में घर 100 तक पहुँचकर ज्ञान की यात्रा पूरी की।
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/student/multimedia/puzzles")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                वापस जाएं
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white"
                onClick={resetGame}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                फिर खेलें
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ─── PLAYING / RESULT-FEEDBACK SCREENS ────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <Header />

      <main className="flex-1 py-4 md:py-6">
        <div className="container mx-auto px-2 md:px-4 max-w-6xl">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-4 px-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/student/multimedia/puzzles")}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              वापस
            </Button>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span>🎲</span> ज्ञान की यात्रा
            </h1>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-amber-600 border-amber-300">
                <Star className="h-3 w-3 mr-1" />
                {score} अंक
              </Badge>
              <Badge variant="outline" className="text-blue-600 border-blue-300">
                चाल {moves}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            {/* ── Board ─────────────────────────────────────────────────── */}
            <div className="flex-1 overflow-x-auto">
              <div
                className="grid border-2 border-gray-800 rounded-xl overflow-hidden shadow-xl mx-auto"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(10, 1fr)",
                  maxWidth: "520px",
                  minWidth: "300px",
                }}
              >
                {boardRows.map((row, rIdx) =>
                  row.map((num) => (
                    <BoardCell
                      key={num}
                      num={num}
                      isPlayer={num === position}
                      special={SPECIAL_SQUARES[num]}
                    />
                  ))
                )}
              </div>

              {/* Legend */}
              <div className="mt-3 grid grid-cols-2 gap-1 max-w-[520px] mx-auto">
                {legend.map((l, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <div className={`w-4 h-4 rounded border flex-shrink-0 ${l.color}`} />
                    <span>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Side Panel ────────────────────────────────────────────── */}
            <div className="lg:w-72 space-y-4">
              {/* Player status */}
              <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4 text-orange-500" />
                  खेल की स्थिति
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">वर्तमान घर:</span>
                    <span className="font-bold text-orange-600">
                      {position === 0 ? "शुरुआत" : `घर ${position}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">लक्ष्य:</span>
                    <span className="font-bold text-green-600">घर 100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">बचे हुए:</span>
                    <span className="font-bold text-blue-600">{100 - position} खाने</span>
                  </div>
                  {skipTurns > 0 && (
                    <div className="flex items-center gap-1 text-amber-600 bg-amber-50 rounded-lg px-2 py-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span>{skipTurns} बारी छूटेगी</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dice area */}
              <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4 text-center">
                <div className="flex justify-center mb-4">
                  <DiceFace value={diceValue} rolling={rolling} />
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold"
                  onClick={rollDice}
                  disabled={!canRoll || rolling || phase !== "playing"}
                >
                  <Dices className="h-4 w-4 mr-2" />
                  {rolling
                    ? "पासा घूम रहा है..."
                    : skipTurns > 0
                    ? `बारी छोड़ें (${skipTurns})`
                    : "पासा फेंकें"}
                </Button>
              </div>

              {/* Activity log */}
              <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4">
                <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  गतिविधि
                </h3>
                <div className="space-y-1 text-xs text-gray-600 max-h-36 overflow-y-auto">
                  {log.length === 0 && (
                    <p className="text-gray-400 italic">पासा फेंकें और खेल शुरू करें!</p>
                  )}
                  {log.map((entry, i) => (
                    <p key={i} className={i === 0 ? "text-gray-800 font-medium" : ""}>
                      {entry}
                    </p>
                  ))}
                </div>
              </div>

              {/* Reset button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={resetGame}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                नया खेल
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* ── Question Dialog ──────────────────────────────────────────────────── */}
      <Dialog
        open={phase === "question" || phase === "result-feedback"}
        onOpenChange={() => {}}
      >
        <DialogContent
          className="max-w-lg"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              {questionContext === "ladder" && (
                <span className="text-green-600 flex items-center gap-1">
                  🪜 सीढ़ी का प्रश्न
                </span>
              )}
              {questionContext === "snake" && (
                <span className="text-red-600 flex items-center gap-1">
                  🐍 साँप का प्रश्न
                </span>
              )}
              {questionContext === "question" && (
                <span className="text-amber-600 flex items-center gap-1">
                  ❓ प्रश्न बॉक्स
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {currentQuestion && (
            <div className="space-y-4">
              {/* Context hint */}
              {selectedOption === null && (
                <div
                  className={`text-xs px-3 py-2 rounded-lg ${
                    questionContext === "ladder"
                      ? "bg-green-50 text-green-700"
                      : questionContext === "snake"
                      ? "bg-red-50 text-red-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {questionContext === "ladder" &&
                    "✅ सही उत्तर दें → सीढ़ी चढ़ें | ❌ गलत → यहीं रहें"}
                  {questionContext === "snake" &&
                    "✅ सही उत्तर दें → साँप से बचें | ❌ गलत → साँप की पूँछ पर जाएं"}
                  {questionContext === "question" &&
                    "✅ सही उत्तर → +2 आगे | ❌ गलत → -2 पीछे + 1 बारी छोड़"}
                </div>
              )}

              {/* Question */}
              <p className="font-semibold text-gray-800 text-base leading-relaxed">
                {currentQuestion.question}
              </p>

              {/* Options */}
              <div className="grid grid-cols-1 gap-2">
                {currentQuestion.options.map((opt, idx) => {
                  let btnClass =
                    "w-full text-left px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ";

                  if (selectedOption === null) {
                    btnClass += "border-gray-200 bg-white hover:border-orange-400 hover:bg-orange-50 cursor-pointer";
                  } else if (idx === currentQuestion.correct) {
                    btnClass += "border-green-500 bg-green-50 text-green-700";
                  } else if (idx === selectedOption) {
                    btnClass += "border-red-400 bg-red-50 text-red-700";
                  } else {
                    btnClass += "border-gray-100 bg-gray-50 text-gray-400";
                  }

                  const labels = ["A", "B", "C", "D"];

                  return (
                    <button
                      key={idx}
                      className={btnClass}
                      onClick={() => handleAnswer(idx)}
                      disabled={selectedOption !== null}
                    >
                      <span className="font-bold mr-2">{labels[idx]}.</span>
                      {opt}
                      {selectedOption !== null && idx === currentQuestion.correct && (
                        <CheckCircle2 className="inline h-4 w-4 ml-2 text-green-500" />
                      )}
                      {selectedOption === idx && idx !== currentQuestion.correct && (
                        <XCircle className="inline h-4 w-4 ml-2 text-red-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation + Continue */}
              {selectedOption !== null && (
                <div className="space-y-3">
                  <div
                    className={`p-3 rounded-xl text-sm ${
                      selectedOption === currentQuestion.correct
                        ? "bg-green-50 border border-green-200 text-green-800"
                        : "bg-red-50 border border-red-200 text-red-800"
                    }`}
                  >
                    <p className="font-semibold mb-1">
                      {selectedOption === currentQuestion.correct
                        ? "✅ शाबाश! सही उत्तर"
                        : "❌ गलत उत्तर"}
                    </p>
                    <p>{currentQuestion.explanation}</p>
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold"
                    onClick={dismissFeedback}
                  >
                    आगे बढ़ें →
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default GyanKiYatra;
