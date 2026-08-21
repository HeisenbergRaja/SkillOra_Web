const fs = require('fs');
const https = require('https');

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=');
  if (key && vals.length) {
    env[key.trim()] = vals.join('=').trim().replace(/"/g, '');
  }
});

const projectId = env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'];
const skillId = "16d84c1b-40ab-49ac-af35-0f2d60bd13f0";

const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/skills/${skillId}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const finalQuiz = json.fields.finalQuiz.mapValue.fields;
      console.log(`QUIZ_ID: ${finalQuiz.quizId.stringValue}`);
      console.log(`TOTAL_QUESTIONS: ${finalQuiz.totalQuestions.integerValue}`);
      console.log(`Q_ARRAY_LENGTH: ${finalQuiz.questions.arrayValue.values.length}`);
      
      const firstQ = finalQuiz.questions.arrayValue.values[0].mapValue.fields;
      console.log(`FIRST_Q_TEXT: ${firstQ.question.stringValue}`);
      console.log(`FIRST_Q_OPTIONS: ${firstQ.options.arrayValue.values.length}`);
      console.log(`FIRST_Q_CORRECT: ${firstQ.correctAnswer.integerValue}`);
      
      console.log("SCHEMA MATCHES!");
    } catch(e) {
      console.log("Error parsing REST:", e.message);
    }
  });
});
