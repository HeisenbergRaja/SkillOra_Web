const fs = require('fs');
const https = require('https');

// Read env
const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=');
  if (key && vals.length) {
    env[key.trim()] = vals.join('=').trim().replace(/"/g, '');
  }
});

const projectId = env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'];

// Use REST API to get skills
const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/skills`;

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.documents && json.documents.length > 0) {
        const doc = json.documents[0];
        const skillId = doc.name.split('/').pop();
        const creatorId = doc.fields.creatorId.stringValue;
        console.log(`FOUND_SKILL: ${skillId}`);
        console.log(`FOUND_CREATOR: ${creatorId}`);
      } else {
        console.log("No skills found via REST.");
      }
    } catch(e) {
      console.log("Error parsing REST:", e.message);
    }
  });
});
