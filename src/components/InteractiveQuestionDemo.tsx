import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Info } from 'lucide-react';

interface InteractiveQuestionDemoProps {
  module: string;
  question: string;
  demoType?: string;
  demoData?: any;
  autoPlay?: boolean;
}

const InteractiveQuestionDemo: React.FC<InteractiveQuestionDemoProps> = ({
  module,
  question,
  demoType,
  demoData,
  autoPlay = false
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [step, setStep] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const animationRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animation templates based on module type
  const getAnimationTemplate = () => {
    switch (module) {
      case 'श्रृंखला पूर्णता':
        return <SeriesCompletionDemo question={question} step={step} />;
      case 'कैलेंडर और समय':
        return <CalendarDemo question={question} step={step} demoData={demoData} />;
      case 'दिशा ज्ञान':
        return <DirectionDemo question={question} step={step} demoData={demoData} />;
      case 'रक्त संबंध':
        return <BloodRelationDemo question={question} step={step} demoData={demoData} />;
      case 'वेन आरेख':
        return <VennDiagramDemo question={question} step={step} demoData={demoData} />;
      case 'कूटभाषा':
        return <CodingDecodingDemo question={question} step={step} />;
      case 'पहेलियाँ और बैठने की व्यवस्था':
        return <SeatingArrangementDemo question={question} step={step} demoData={demoData} />;
      default:
        return <DefaultAnimationDemo question={question} step={step} />;
    }
  };

  useEffect(() => {
    if (isPlaying) {
      const maxSteps = getMaxSteps();
      if (step < maxSteps) {
        const timer = setTimeout(() => {
          setStep(step + 1);
        }, 2000); // 2 seconds per step
        return () => clearTimeout(timer);
      } else {
        setIsPlaying(false);
      }
    }
  }, [isPlaying, step]);

  const getMaxSteps = () => {
    // Different modules have different number of steps
    const stepsMap: { [key: string]: number } = {
      'श्रृंखला पूर्णता': 5,
      'कैलेंडर और समय': 7,
      'दिशा ज्ञान': 6,
      'रक्त संबंध': 5,
      'वेन आरेख': 4,
      'कूटभाषा': 5,
      'पहेलियाँ और बैठने की व्यवस्था': 6,
    };
    return stepsMap[module] || 4;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setStep(0);
    setIsPlaying(false);
  };

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-purple-900">इंटरैक्टिव डेमो</h3>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="border-purple-300"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlayPause}
              className="border-purple-300"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 min-h-[300px] relative overflow-hidden">
          {getAnimationTemplate()}
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>चरण {step + 1} / {getMaxSteps() + 1}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowExplanation(!showExplanation)}
          >
            {showExplanation ? 'व्याख्या छुपाएं' : 'व्याख्या देखें'}
          </Button>
        </div>

        {showExplanation && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-gray-700">
            {getStepExplanation(module, step)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Series Completion Animation
const SeriesCompletionDemo: React.FC<{ question: string; step: number }> = ({ question, step }) => {
  // Extract series from question (e.g., "A, B, D, ?, K, P")
  const seriesMatch = question.match(/([A-Z0-9]+(?:,\s*[A-Z0-9?]+)*)/);
  const series = seriesMatch ? seriesMatch[0].split(',').map(s => s.trim()) : [];

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="flex gap-4 items-center">
        {series.map((item, index) => (
          <div
            key={index}
            className={`
              w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold
              transition-all duration-500 transform
              ${index <= step 
                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white scale-110 shadow-lg' 
                : 'bg-gray-200 text-gray-400 scale-100'
              }
              ${item === '?' ? 'border-4 border-dashed border-yellow-400 animate-pulse' : ''}
            `}
            style={{
              animationDelay: `${index * 0.2}s`
            }}
          >
            {item}
          </div>
        ))}
      </div>
      
      {step >= series.length && (
        <div className="mt-6 text-center animate-fade-in">
          <p className="text-sm text-gray-600">
            पैटर्न: प्रत्येक अक्षर {series.length > 3 ? 'के बीच अंतर बढ़ रहा है' : 'समान अंतर पर है'}
          </p>
        </div>
      )}
    </div>
  );
};

// Calendar Demo with day-wise travel animation
const CalendarDemo: React.FC<{ question: string; step: number; demoData?: any }> = ({ 
  question, 
  step,
  demoData 
}) => {
  const days = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];
  const currentDay = demoData?.startDay || 0;
  const daysToAdd = demoData?.daysToAdd || 15;
  const currentStep = Math.min(step, daysToAdd);
  const finalDay = (currentDay + currentStep) % 7;

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h4 className="text-lg font-semibold mb-4 text-gray-700">
        कैलेंडर विज़ुअलाइज़ेशन
      </h4>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {days.map((day, index) => (
          <div
            key={index}
            className={`
              w-16 h-16 rounded-lg flex flex-col items-center justify-center
              transition-all duration-300 transform
              ${index === currentDay 
                ? 'bg-green-500 text-white scale-110 shadow-lg ring-2 ring-green-300' 
                : index === finalDay && step > 0
                ? 'bg-blue-500 text-white scale-110 shadow-lg ring-2 ring-blue-300 animate-bounce'
                : 'bg-gray-100 text-gray-600'
              }
            `}
          >
            <span className="text-xs font-semibold">{day}</span>
          </div>
        ))}
      </div>

      {/* Days Counter */}
      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
        <div className="text-center">
          <p className="text-xs text-gray-600">प्रारंभ</p>
          <p className="text-xl font-bold text-green-600">{days[currentDay]}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">+</span>
          <div className="text-center px-3 py-1 bg-white rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{currentStep}</p>
            <p className="text-xs text-gray-500">दिन</p>
          </div>
          <span className="text-2xl">=</span>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600">परिणाम</p>
          <p className="text-xl font-bold text-blue-600">{days[finalDay]}</p>
        </div>
      </div>
    </div>
  );
};

// Direction Demo with animated movement
const DirectionDemo: React.FC<{ question: string; step: number; demoData?: any }> = ({
  question,
  step,
  demoData
}) => {
  const moves = demoData?.moves || [
    { direction: 'उत्तर', distance: 10 },
    { direction: 'पूर्व', distance: 8 },
    { direction: 'दक्षिण', distance: 5 }
  ];
  
  const currentMoves = moves.slice(0, step);
  let x = 0, y = 0;
  
  currentMoves.forEach((move: any) => {
    if (move.direction === 'उत्तर') y -= move.distance;
    if (move.direction === 'दक्षिण') y += move.distance;
    if (move.direction === 'पूर्व') x += move.distance;
    if (move.direction === 'पश्चिम') x -= move.distance;
  });

  return (
    <div className="relative h-full flex items-center justify-center">
      {/* Compass */}
      <div className="absolute top-2 right-2 w-20 h-20 border-2 border-gray-300 rounded-full flex items-center justify-center">
        <div className="text-xs font-bold">
          <div className="text-red-600">उ</div>
          <div className="flex justify-between text-gray-500">
            <span>प</span>
            <span className="mx-2">•</span>
            <span>पू</span>
          </div>
          <div className="text-center text-gray-500">द</div>
        </div>
      </div>

      {/* Grid */}
      <svg width="400" height="300" className="border border-gray-200">
        {/* Grid lines */}
        {[...Array(20)].map((_, i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={i * 15}
            x2="400"
            y2={i * 15}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}
        {[...Array(27)].map((_, i) => (
          <line
            key={`v-${i}`}
            x1={i * 15}
            y1="0"
            x2={i * 15}
            y2="300"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}

        {/* Start point */}
        <circle cx="200" cy="150" r="5" fill="#10b981" />
        <text x="210" y="155" fill="#10b981" fontSize="12" fontWeight="bold">
          प्रारंभ
        </text>

        {/* Path */}
        <path
          d={`M 200 150 L ${200 + x * 10} ${150 + y * 10}`}
          stroke="#3b82f6"
          strokeWidth="3"
          fill="none"
          strokeDasharray="5,5"
          className="animate-dash"
        />

        {/* Current position */}
        <circle 
          cx={200 + x * 10} 
          cy={150 + y * 10} 
          r="8" 
          fill="#ef4444"
          className="animate-pulse"
        />
        <text 
          x={200 + x * 10 + 10} 
          y={150 + y * 10 + 5} 
          fill="#ef4444" 
          fontSize="12" 
          fontWeight="bold"
        >
          अंत
        </text>
      </svg>

      {/* Move description */}
      {step > 0 && step <= moves.length && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-100 px-4 py-2 rounded-lg animate-fade-in">
          <p className="text-sm font-semibold">
            {moves[step - 1].direction} दिशा में {moves[step - 1].distance} कदम
          </p>
        </div>
      )}
    </div>
  );
};

// Blood Relation Demo with family tree
const BloodRelationDemo: React.FC<{ question: string; step: number; demoData?: any }> = ({
  question,
  step,
  demoData
}) => {
  const relations = demoData?.relations || [
    { from: 'A', to: 'B', relation: 'पिता' },
    { from: 'B', to: 'C', relation: 'भाई' }
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h4 className="text-lg font-semibold mb-4 text-gray-700">
        पारिवारिक संबंध ट्री
      </h4>
      
      <svg width="400" height="250">
        {/* Nodes */}
        {['A', 'B', 'C'].map((person, index) => (
          <g key={person}>
            <circle
              cx={150 + index * 100}
              cy={100 + (index % 2) * 60}
              r="30"
              fill={step > index ? '#3b82f6' : '#e5e7eb'}
              className="transition-all duration-500"
            />
            <text
              x={150 + index * 100}
              y={105 + (index % 2) * 60}
              textAnchor="middle"
              fill="white"
              fontSize="20"
              fontWeight="bold"
            >
              {person}
            </text>
          </g>
        ))}

        {/* Relations */}
        {relations.slice(0, step).map((rel: any, index: number) => (
          <g key={index}>
            <line
              x1={150 + index * 100 + 30}
              y1={100 + (index % 2) * 60}
              x2={250 + index * 100 - 30}
              y2={100 + ((index + 1) % 2) * 60}
              stroke="#10b981"
              strokeWidth="3"
              className="animate-draw"
            />
            <text
              x={200 + index * 100}
              y={95 + (index % 2) * 60}
              textAnchor="middle"
              fill="#10b981"
              fontSize="12"
              fontWeight="bold"
            >
              {rel.relation}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

// Venn Diagram Demo
const VennDiagramDemo: React.FC<{ question: string; step: number; demoData?: any }> = ({
  question,
  step,
  demoData
}) => {
  return (
    <div className="flex items-center justify-center h-full">
      <svg width="400" height="300">
        {/* Circle A */}
        <circle
          cx="150"
          cy="150"
          r="80"
          fill={step >= 1 ? 'rgba(59, 130, 246, 0.3)' : 'rgba(229, 231, 235, 0.3)'}
          stroke="#3b82f6"
          strokeWidth="3"
          className="transition-all duration-500"
        />
        <text x="120" y="150" fill="#1e40af" fontSize="16" fontWeight="bold">
          समूह A
        </text>

        {/* Circle B */}
        <circle
          cx="250"
          cy="150"
          r="80"
          fill={step >= 2 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(229, 231, 235, 0.3)'}
          stroke="#10b981"
          strokeWidth="3"
          className="transition-all duration-500"
        />
        <text x="250" y="150" fill="#065f46" fontSize="16" fontWeight="bold">
          समूह B
        </text>

        {/* Intersection highlight */}
        {step >= 3 && (
          <>
            <ellipse
              cx="200"
              cy="150"
              rx="40"
              ry="80"
              fill="rgba(239, 68, 68, 0.4)"
              className="animate-pulse"
            />
            <text x="190" y="155" fill="#991b1b" fontSize="14" fontWeight="bold">
              A ∩ B
            </text>
          </>
        )}
      </svg>
    </div>
  );
};

// Coding-Decoding Demo
const CodingDecodingDemo: React.FC<{ question: string; step: number }> = ({ question, step }) => {
  const word = "CAT";
  const code = "DBU";
  
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8">
      <div className="flex gap-4">
        {word.split('').map((letter, index) => (
          <div key={index} className="text-center">
            <div className={`
              w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold
              transition-all duration-500
              ${step > index 
                ? 'bg-blue-500 text-white transform scale-110' 
                : 'bg-gray-200 text-gray-600'
              }
            `}>
              {letter}
            </div>
            {step > index && (
              <div className="mt-2 animate-bounce">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mx-auto">
                  <path d="M12 5v14m0 0l7-7m-7 7l-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            )}
            {step > index && (
              <div className="mt-2 w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold bg-green-500 text-white animate-fade-in">
                {code[index]}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {step >= word.length && (
        <div className="text-center animate-fade-in">
          <p className="text-sm text-gray-600">
            पैटर्न: प्रत्येक अक्षर +1 स्थान आगे बढ़ता है
          </p>
        </div>
      )}
    </div>
  );
};

// Seating Arrangement Demo
const SeatingArrangementDemo: React.FC<{ question: string; step: number; demoData?: any }> = ({
  question,
  step,
  demoData
}) => {
  const people = ['A', 'B', 'C', 'D', 'E'];
  
  return (
    <div className="flex items-center justify-center h-full">
      <div className="relative">
        {/* Table */}
        <div className="w-64 h-48 border-4 border-gray-400 rounded-lg bg-gradient-to-br from-amber-100 to-amber-200"></div>
        
        {/* Seats */}
        {people.map((person, index) => {
          const positions = [
            { top: -40, left: 80 },      // Top
            { top: 40, left: -40 },      // Left
            { top: 40, right: -40 },     // Right
            { bottom: -40, left: 40 },   // Bottom-left
            { bottom: -40, right: 40 },  // Bottom-right
          ];
          
          return (
            <div
              key={person}
              className={`
                absolute w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold
                transition-all duration-500 transform
                ${step > index 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white scale-110 shadow-lg' 
                  : 'bg-gray-300 text-gray-500'
                }
              `}
              style={positions[index]}
            >
              {person}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Default animation for other question types
const DefaultAnimationDemo: React.FC<{ question: string; step: number }> = ({ question, step }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <div className={`
        text-6xl mb-4 transition-all duration-500 transform
        ${step > 0 ? 'scale-110 rotate-12' : 'scale-100'}
      `}>
        🧠
      </div>
      <p className="text-lg text-gray-700 font-semibold">
        प्रश्न को ध्यान से पढ़ें और विकल्पों का विश्लेषण करें
      </p>
      {step > 1 && (
        <div className="mt-4 text-sm text-gray-600 animate-fade-in">
          प्रत्येक विकल्प की तुलना करें और सबसे उपयुक्त उत्तर चुनें
        </div>
      )}
    </div>
  );
};

// Step explanations
const getStepExplanation = (module: string, step: number): string => {
  const explanations: { [key: string]: string[] } = {
    'श्रृंखला पूर्णता': [
      'पहले अक्षर से शुरू करें',
      'दो लगातार अक्षरों के बीच अंतर देखें',
      'पैटर्न की पहचान करें - समान अंतर या बढ़ता अंतर',
      'अगले अक्षर की गणना करें',
      'उत्तर की पुष्टि करें'
    ],
    'कैलेंडर और समय': [
      'प्रारंभिक दिन की पहचान करें',
      'जोड़े जाने वाले दिनों की गिनती करें',
      'सप्ताह चक्र (7 दिन) समझें',
      '7 से भाग दें और शेष निकालें',
      'शेष दिन आगे गिनें',
      'अंतिम दिन प्राप्त करें'
    ],
    'दिशा ज्ञान': [
      'प्रारंभिक बिंदु चिह्नित करें',
      'पहली चाल की दिशा और दूरी नोट करें',
      'नए स्थान पर पहुंचें',
      'अगली चाल लागू करें',
      'अंतिम स्थान की गणना करें',
      'प्रारंभ से अंत तक दूरी/दिशा खोजें'
    ]
  };

  return explanations[module]?.[step] || 'अगले चरण के लिए प्रतीक्षा करें...';
};

export default InteractiveQuestionDemo;
