require("dotenv").config({ path: __dirname + "/../.env" });

const mongoose = require("mongoose");
const Question = require("../models/Question");

const MONGO_URI = process.env.MONGO_URI;

const questions = [
  {
    subject: "विज्ञान",
    class: "NMMS",
    topic: "गति",
    question: "निम्नलिखित में से कौन-सा सरल रेखीय गति का उदाहरण है?",
    options: [
      "लोलक की गति",
      "घूमते हुए लट्टू की गति",
      "सीधी सड़क पर चलती हुई कार",
      "सूर्य के चारों ओर पृथ्वी की गति"
    ],
    correctAnswer: "सीधी सड़क पर चलती हुई कार",
    hint: { text: "सरल रेखीय गति सीधी रेखा में होती है।" }
  },
  {
    subject: "विज्ञान",
    class: "NMMS",
    topic: "गति",
    question: "किसी वस्तु को गतिशील कहा जाता है जब वह:",
    options: [
      "अपना आकार बदलती है",
      "अपना रूप बदलती है",
      "समय के साथ अपनी स्थिति बदलती है",
      "दिखाई देती है"
    ],
    correctAnswer: "समय के साथ अपनी स्थिति बदलती है",
    hint: { text: "स्थिति परिवर्तन गति को दर्शाता है।" }
  },
  {
    subject: "विज्ञान",
    class: "NMMS",
    topic: "गति",
    question: "निम्नलिखित में से कौन-सी आवर्त गति है?",
    options: [
      "सड़क पर दौड़ता हुआ लड़का",
      "झूलता हुआ लोलक",
      "राजमार्ग पर चलती बस",
      "स्वतंत्र रूप से गिरता पत्थर"
    ],
    correctAnswer: "झूलता हुआ लोलक",
    hint: { text: "आवर्त गति समय-समय पर दोहराई जाती है।" }
  },
  {
    subject: "विज्ञान",
    class: "NMMS",
    topic: "गति",
    question: "पंखे के ब्लेड की गति किस प्रकार की होती है?",
    options: [
      "सरल रेखीय गति",
      "स्थानांतरण गति",
      "वृत्तीय गति",
      "दोलन गति"
    ],
    correctAnswer: "वृत्तीय गति",
    hint: { text: "पंखे के ब्लेड वृत्त में घूमते हैं।" }
  },
  {
    subject: "विज्ञान",
    class: "NMMS",
    topic: "गति",
    question: "यदि कोई ट्रेन समान समयांतराल में समान दूरी तय करती है, तो उसकी गति कहलाती है:",
    options: [
      "असमान गति",
      "वृत्तीय गति",
      "समान गति",
      "आवर्त गति"
    ],
    correctAnswer: "समान गति",
    hint: { text: "समान दूरी + समान समय = समान गति" }
  },
  {
    subject: "विज्ञान",
    class: "NMMS",
    topic: "गति",
    question: "निम्नलिखित में से कौन-सी गति आवर्त और दोलन दोनों है?",
    options: [
      "सूर्य के चारों ओर पृथ्वी की गति",
      "लोलक की गति",
      "सड़क पर चलती कार",
      "घूमता हुआ पहिया"
    ],
    correctAnswer: "लोलक की गति",
    hint: { text: "लोलक आगे-पीछे दोहराता है।" }
  },
  {
    subject: "विज्ञान",
    class: "NMMS",
    topic: "गति",
    question: "एक लड़का 10 मीटर पूर्व और फिर 10 मीटर पश्चिम चलता है। उसका विस्थापन कितना होगा?",
    options: [
      "0 मीटर",
      "10 मीटर",
      "20 मीटर",
      "निर्धारित नहीं"
    ],
    correctAnswer: "0 मीटर",
    hint: { text: "प्रारंभ और अंतिम स्थिति समान है।" }
  },
  {
    subject: "विज्ञान",
    class: "NMMS",
    topic: "गति",
    question: "किसी वस्तु द्वारा तय की गई दूरी हमेशा होती है:",
    options: [
      "विस्थापन के बराबर",
      "विस्थापन से कम",
      "विस्थापन से अधिक या बराबर",
      "विस्थापन से स्वतंत्र"
    ],
    correctAnswer: "विस्थापन से अधिक या बराबर",
    hint: { text: "दूरी कभी कम नहीं हो सकती।" }
  },
  {
    subject: "विज्ञान",
    class: "NMMS",
    topic: "गति",
    question: "एक कण वृत्तीय पथ पर चलकर प्रारंभिक बिंदु पर लौट आता है। सही कथन कौन-सा है?",
    options: [
      "दूरी शून्य है",
      "विस्थापन अधिकतम है",
      "विस्थापन शून्य है",
      "दूरी विस्थापन के बराबर है"
    ],
    correctAnswer: "विस्थापन शून्य है",
    hint: { text: "प्रारंभ और अंत समान है।" }
  },
  {
    subject: "विज्ञान",
    class: "NMMS",
    topic: "गति",
    question: "एक व्यक्ति 3 मीटर उत्तर और 4 मीटर पूर्व चलता है। उसका विस्थापन कितना होगा?",
    options: [
      "5 मीटर",
      "7 मीटर",
      "1 मीटर",
      "25 मीटर"
    ],
    correctAnswer: "5 मीटर",
    hint: { text: "पाइथागोरस प्रमेय लागू होता है।" }
  }
];

async function insertQuestions() {
  await mongoose.connect(MONGO_URI);
  await Question.insertMany(questions);
  console.log("✅ 10 Science (Motion) questions inserted successfully");
  await mongoose.disconnect();
}

insertQuestions().catch(console.error);
