import fetch from "node-fetch"; 

const questions =[
  {
    "subject": "गणित",
    "class": "NMMS",
    "topic": "बीजगणितीय व्यंजक और उनके गुणनखण्ड",
    "question": "x² + 7x + 10 को गुणनखण्डों में तोड़िए।",
    "questionImage": "",
    "options": ["(x+2)(x+5)", "(x+1)(x+10)", "(x+3)(x+4)", "(x+7)(x+10)"],
    "correctAnswer": "(x+2)(x+5)",
    "hint": {
      "text": "ऐसे दो संख्याएँ खोजें जिनका गुणनफल 10 और योग 7 हो।",
      "image": "",
      "video": ""
    }
  },
  {
    "subject": "गणित",
    "class": "NMMS",
    "topic": "बीजगणितीय व्यंजक और उनके गुणनखण्ड",
    "question": "a² - b² का गुणनखण्ड कीजिए।",
    "questionImage": "",
    "options": ["(a+b)(a-b)", "(a+b)²", "(a-b)²", "(a-b)(a-b)"],
    "correctAnswer": "(a+b)(a-b)",
    "hint": {
      "text": "यह वर्गों का अंतर है: a² - b² = (a+b)(a-b)।",
      "image": "",
      "video": ""
    }
  },
  {
    "subject": "गणित",
    "class": "NMMS",
    "topic": "बीजगणितीय व्यंजक और उनके गुणनखण्ड",
    "question": "x² + 11x + 24 को गुणनखण्डों में तोड़िए।",
    "questionImage": "",
    "options": ["(x+6)(x+4)", "(x+8)(x+3)", "(x+12)(x-1)", "(x+2)(x+12)"],
    "correctAnswer": "(x+8)(x+3)",
    "hint": {
      "text": "ऐसे दो संख्याएँ खोजें जिनका गुणनफल 24 और योग 11 हो।",
      "image": "",
      "video": ""
    }
  },
  {
    "subject": "गणित",
    "class": "NMMS",
    "topic": "बीजगणितीय व्यंजक और उनके गुणनखण्ड",
    "question": "3x² + 6x का गुणनखण्ड कीजिए।",
    "questionImage": "",
    "options": ["3x(x+2)", "3(x²+2)", "x(3x+2)", "(x+3)(x+2)"],
    "correctAnswer": "3x(x+2)",
    "hint": {
      "text": "सामान्य गुणनखण्ड (common factor) निकालें।",
      "image": "",
      "video": ""
    }
  },
  {
    "subject": "गणित",
    "class": "NMMS",
    "topic": "बीजगणितीय व्यंजक और उनके गुणनखण्ड",
    "question": "y² - 9y का गुणनखण्ड कीजिए।",
    "questionImage": "",
    "options": ["y(y-9)", "(y-3)(y-3)", "(y+9)(y-1)", "(y-9)(y-9)"],
    "correctAnswer": "y(y-9)",
    "hint": {
      "text": "सामान्य गुणनखण्ड निकालें: y² - 9y = y(y-9)",
      "image": "",
      "video": ""
    }
  },
  {
    "subject": "गणित",
    "class": "NMMS",
    "topic": "बीजगणितीय व्यंजक और उनके गुणनखण्ड",
    "question": "x² + 12x + 36 का गुणनखण्ड कीजिए।",
    "questionImage": "",
    "options": ["(x+6)²", "(x+12)(x+3)", "(x+9)(x+4)", "(x+2)(x+18)"],
    "correctAnswer": "(x+6)²",
    "hint": {
      "text": "यह पूर्ण वर्ग त्रिपद (perfect square trinomial) है।",
      "image": "",
      "video": ""
    }
  },
  {
    "subject": "गणित",
    "class": "NMMS",
    "topic": "बीजगणितीय व्यंजक और उनके गुणनखण्ड",
    "question": "a² + 2ab + b² का गुणनखण्ड कीजिए।",
    "questionImage": "",
    "options": ["(a+b)²", "(a-b)²", "(a+b)(a-b)", "(a²+b²)"],
    "correctAnswer": "(a+b)²",
    "hint": {
      "text": "सूत्र: a² + 2ab + b² = (a+b)²",
      "image": "",
      "video": ""
    }
  },
  {
    "subject": "गणित",
    "class": "NMMS",
    "topic": "बीजगणितीय व्यंजक और उनके गुणनखण्ड",
    "question": "25x² - y² का गुणनखण्ड कीजिए।",
    "questionImage": "",
    "options": ["(5x+y)(5x-y)", "(25x-y)(x+y)", "(x+5)(x-5)", "(5x²+y)(5x²-y)"],
    "correctAnswer": "(5x+y)(5x-y)",
    "hint": {
      "text": "यह वर्गों का अंतर है।",
      "image": "",
      "video": ""
    }
  },
  {
    "subject": "गणित",
    "class": "NMMS",
    "topic": "बीजगणितीय व्यंजक और उनके गुणनखण्ड",
    "question": "x³ - 27 का गुणनखण्ड कीजिए।",
    "questionImage": "",
    "options": ["(x-3)(x²+3x+9)", "(x-27)(x²+9)", "(x-3)(x²-9)", "(x-9)(x²+3x+3)"],
    "correctAnswer": "(x-3)(x²+3x+9)",
    "hint": {
      "text": "घनों का अंतर: a³ - b³ = (a-b)(a²+ab+b²)",
      "image": "",
      "video": ""
    }
  },
  {
    "subject": "गणित",
    "class": "NMMS",
    "topic": "बीजगणितीय व्यंजक और उनके गुणनखण्ड",
    "question": "6x²y - 9xy² का गुणनखण्ड कीजिए।",
    "questionImage": "",
    "options": ["3xy(2x-3y)", "(6x-9y)(x-y)", "xy(6x-9y)", "3y(x²-3xy)"],
    "correctAnswer": "3xy(2x-3y)",
    "hint": {
      "text": "सबसे बड़ा सामान्य गुणनखण्ड निकालें।",
      "image": "",
      "video": ""
    }
  },
  {
    "subject": "गणित",
    "class": "NMMS",
    "topic": "बीजगणितीय व्यंजक और उनके गुणनखण्ड",
    "question": "x² - 16 का गुणनखण्ड कीजिए।",
    "questionImage": "",
    "options": ["(x+4)(x-4)", "(x+8)(x-2)", "(x²-8)(x²+2)", "(x-16)(x+1)"],
    "correctAnswer": "(x+4)(x-4)",
    "hint": {
      "text": "यह वर्गों का अंतर है।",
      "image": "",
      "video": ""
    }
  },
  {
    "subject": "गणित",
    "class": "NMMS",
    "topic": "बीजगणितीय व्यंजक और उनके गुणनखण्ड",
    "question": "a² - 2ab + b² का गुणनखण्ड कीजिए।",
    "questionImage": "",
    "options": ["(a-b)²", "(a+b)²", "(a-b)(a+b)", "a²-b²"],
    "correctAnswer": "(a-b)²",
    "hint": {
      "text": "सूत्र: a² - 2ab + b² = (a-b)²",
      "image": "",
      "video": ""
    }
  },
  {
    "subject": "गणित",
    "class": "NMMS",
    "topic": "बीजगणितीय व्यंजक और उनके गुणनखण्ड",
    "question": "m² - 49 का गुणनखण्ड कीजिए।",
    "questionImage": "",
    "options": ["(m+7)(m-7)", "(m+49)(m-1)", "(m-49)(m+1)", "(m+14)(m-14)"],
    "correctAnswer": "(m+7)(m-7)",
    "hint": {
      "text": "वर्गों का अंतर: m² - 7²",
      "image": "",
      "video": ""
    }
  },
  {
    "subject": "गणित",
    "class": "NMMS",
    "topic": "बीजगणितीय व्यंजक और उनके गुणनखण्ड",
    "question": "2x² + 10x का गुणनखण्ड कीजिए।",
    "questionImage": "",
    "options": ["2x(x+5)", "(x+2)(x+5)", "(2x+5)(x+1)", "x(2x+10)"],
    "correctAnswer": "2x(x+5)",
    "hint": {
      "text": "सामान्य गुणनखण्ड निकालें।",
      "image": "",
      "video": ""
    }
  },
  {
    "subject": "गणित",
    "class": "NMMS",
    "topic": "बीजगणितीय व्यंजक और उनके गुणनखण्ड",
    "question": "x² + 9x + 20 का गुणनखण्ड कीजिए।",
    "questionImage": "",
    "options": ["(x+4)(x+5)", "(x+2)(x+10)", "(x+1)(x+20)", "(x+9)(x+1)"],
    "correctAnswer": "(x+4)(x+5)",
    "hint": {
      "text": "दो संख्याएँ खोजें जिनका गुणनफल 20 और योग 9 हो।",
      "image": "",
      "video": ""
    }
  }
]

;


async function uploadQuestion(question) {
  try {
    const response = await fetch("http://localhost:5000/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(question), // ✅ Fix: convert object to JSON string
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed with status ${response.status}: ${errorText}`);
    }

    console.log(`✅ Uploaded: "${question.question}"`);
  } catch (error) {
    console.error(
      `❌ Error: "${question?.question || "undefined"}"`,
      error.message
    );
  }
}

async function uploadAllQuestions() {
  for (const question of questions) {
    await uploadQuestion(question);
  }
  console.log("✅ All questions uploaded!");
}

uploadAllQuestions();
