import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

async function test() {
  const deepseek = createOpenAI({
    baseURL: 'https://api.deepseek.com/v1',
    apiKey: 'dummy',
  });
  
  try {
    const { text } = await generateText({
      model: deepseek('deepseek-chat'),
      prompt: 'test',
    });
    console.log(text);
  } catch (e: any) {
    console.error('ERROR:', e.message);
  }
}

test();
