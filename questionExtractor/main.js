const questions = [
  {
    subject: "राजनीति विज्ञान",
    class: "7",
    topic: "भारतीय राजनीति",
    question: "भारत का राष्ट्रपति कितने वर्षों के लिए चुना जाता है?",
    questionImage: "",
    options: ["3 वर्ष", "4 वर्ष", "5 वर्ष", "6 वर्ष"],
    correctAnswer: "5 वर्ष",
    hint: {
      text: "This is the same term duration as the Lok Sabha.",
      image: "imagelink1",
      video: "videolink1",
    },
  },
  {
    subject: "राजनीति विज्ञान",
    class: "7",
    topic: "भारतीय राजनीति",
    question: "भारत में संसद कितने सदनों से मिलकर बनी होती है?",
    questionImage: "",
    options: ["एक", "दो", "तीन", "चार"],
    correctAnswer: "दो",
    hint: {
      text: "It consists of Lok Sabha and Rajya Sabha.",
      image: "imagelink2",
      video: "videolink2",
    },
  },
];


// POST करने वाला फ़ंक्शन
const postQuestions = async () => {
  for (const question of questions) {
    try {
      const response = await fetch("http://localhost:5000/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(question),
      });

      if (response.ok) {
        console.log("प्रश्न सफलतापूर्वक भेजा गया:", question.question);
      } else {
        console.error("भेजने में त्रुटि:", response.statusText);
      }
    } catch (error) {
      console.error("Fetch त्रुटि:", error.message);
    }
  }
};

// फ़ंक्शन कॉल करें
postQuestions();
