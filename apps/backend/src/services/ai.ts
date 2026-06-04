import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

// OpenRouter connection
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "dummy-key",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "SecRitual AI",
  }
});

// Ollama Fallback
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434/api/generate";

export async function generateAIResponse(prompt: string, model: string = "google/gemini-2.5-flash-lite-preview-09-2025") {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      console.warn("No OpenRouter Key provided. Attempting Ollama fallback...");
      return await useOllama(prompt);
    }

    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: model,
        messages: [{ role: "user", content: prompt }]
      });
    } catch (err: any) {
      if (err?.status === 402 || err?.status === 429) {
        console.warn(`OpenRouter model ${model} failed (${err.status}). Trying google/gemini-2.5-flash-lite-preview-09-2025...`);
        completion = await openai.chat.completions.create({
          model: "google/gemini-2.5-flash-lite",
          messages: [{ role: "user", content: prompt }]
        });
      } else {
        throw err;
      }
    }

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("OpenRouter API Failed. Falling back to Ollama.", error);
    return await useOllama(prompt);
  }
}

async function useOllama(prompt: string) {
  try {
    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true"
      },
      body: JSON.stringify({ model: "gemma:2b", prompt: prompt, stream: false })
    });

    // Check if response is okay before parsing JSON
    if (!response.ok) {
      throw new Error(`Ollama HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Ollama Fallback Failed:", error);
    return "Error: AI engine unreachable.";
  }
}
