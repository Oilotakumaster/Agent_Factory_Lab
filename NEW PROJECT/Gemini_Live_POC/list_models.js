import dotenv from 'dotenv';
dotenv.config();

const key = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1alpha/models?key=${key}`;

fetch(url)
  .then(res => res.json())
  .then(data => {
    if (!data.models) {
        console.error("Error fetching models:", data);
        return;
    }
    console.log("All Models:");
    data.models.forEach(m => console.log(m.name, m.supportedGenerationMethods));
  })
  .catch(console.error);
