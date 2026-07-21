import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
  
  // just try to call flash
  try {
    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      prompt: 'Hello',
    });
    console.log('Flash works:', text);
  } catch (e) {
    console.error('Flash failed:', e);
  }
}
main();
