# Ollama Quiz Generation (Web vs Android)

## Overview
Skillora supports local AI quiz generation using the **Qwen 2.5 1.5B / Qwen3 1.7B** model.
- **Android** uses a native `llama.cpp` JNI engine (`LocalLLMEngine`) with a bundled model (`qwen3-1.7b-q4_k_m.gguf`).
- **Web** uses an API route (`/api/quiz/generate`) that connects to a local **Ollama instance** running at `http://localhost:11434`.

## 1. Web Ollama Architecture
Since browsers cannot directly run native C++ LLM inference smoothly with the exact same architecture as Android, the Web application uses Next.js server-side API routes.
```
Creator -> Web UI -> Next.js API (/api/quiz/generate) -> Local Ollama (localhost:11434) -> Firestore
```

## 2. Configuration
The Next.js API uses environment variables to configure the Ollama connection:
- `OLLAMA_BASE_URL`: (Default: `http://localhost:11434`)
- `OLLAMA_MODEL`: (Default: `qwen2.5:1.5b`)

Ensure these are set in your `.env.local` when running the web app locally.

## 3. Prompt Architecture
The system prompt strictly requires `questions`, `options`, `correctAnswer`, and `explanation` with exactly 4 options and a zero-based answer. This is identical to Android's `QuizSystemPrompt.kt`.

## 4. JSON Parsing & Fallback Behavior
Local models can sometimes wrap JSON output in markdown fences (e.g. ` ```json ... ``` `) or include conversational filler text. 
Both Android and Web implement a **JSON Extraction** fallback:
1. Try parsing the raw string.
2. If it fails, extract the substring between the first `{` and the last `}`.
3. Validate the `questions` array and its fields before creating a `FinalQuiz`.

## 5. Security & Authorization
- Quiz generation is restricted to the **Creator** of the Skill.
- The `userId` of the requester is validated against the `creatorId` of the skill stored in Firestore.
- Raw Ollama responses are never directly saved; they are rigorously parsed and deduplicated before updating Firestore.

## 6. Local Development Setup
1. Install [Ollama](https://ollama.com).
2. Run `ollama run qwen2.5:1.5b` to download and start the model.
3. Start the Next.js server (`npm run dev`).
4. As a skill creator, go to your skill's page and click "Generate Quiz".
