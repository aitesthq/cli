import { createGoogleGenerativeAI } from '@ai-sdk/google';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("No API key found in .env");
    return;
  }
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await response.json();
  console.log("Models available to your API key:");
  data.models.forEach((m: any) => {
    console.log(`- ${m.name}`);
  });
}
main();
