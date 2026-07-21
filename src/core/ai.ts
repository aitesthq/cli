import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { AITestConfig } from './config.js';
import * as dotenv from 'dotenv';

dotenv.config();

export function getAIModel(config: AITestConfig) {
  const providerName = config.provider.toLowerCase();
  
  if (providerName === 'openai') {
    const openai = createOpenAI({
      apiKey: config.apiKey || process.env.OPENAI_API_KEY,
    });
    return openai(config.model || 'gpt-4o');
  } 
  
  if (providerName === 'anthropic') {
    const anthropic = createAnthropic({
      apiKey: config.apiKey || process.env.ANTHROPIC_API_KEY,
    });
    return anthropic(config.model || 'claude-3-5-sonnet-20240620');
  }

  if (providerName === 'gemini' || providerName === 'google') {
    const google = createGoogleGenerativeAI({
      apiKey: config.apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });
    return google(config.model || 'gemini-2.5-flash');
  }

  if (providerName === 'deepseek') {
    const deepseek = createDeepSeek({
      apiKey: config.apiKey || process.env.DEEPSEEK_API_KEY,
    });
    return deepseek(config.model || 'deepseek-coder');
  }

  if (providerName === 'ollama') {
    const ollama = createOpenAI({
      baseURL: 'http://localhost:11434/v1',
      apiKey: 'ollama', // API key isn't strictly needed for local Ollama
    });
    return ollama(config.model || 'llama3.1');
  }

  if (providerName === 'custom') {
    const custom = createOpenAI({
      baseURL: config.baseURL,
      apiKey: config.apiKey || process.env.CUSTOM_API_KEY || 'custom',
      headers: config.customHeaders,
    });
    return custom(config.model || 'local-model');
  }

  throw new Error(`Unsupported AI provider: ${config.provider}`);
}

export async function askAI(config: AITestConfig, system: string, prompt: string) {
  const model = getAIModel(config);
  
  const { text } = await generateText({
    model,
    system,
    prompt,
    maxRetries: 5,
    temperature: config.temperature || 0.1,
  });

  return text;
}
