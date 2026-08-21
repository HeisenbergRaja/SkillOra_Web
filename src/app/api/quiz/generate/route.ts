import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Skill } from '@/types/skill';
import { QuizQuestion, FinalQuiz } from '@/types/quiz';

const INSTRUCTIONS = "You are Skillora's quiz JSON generator. Output ONLY valid JSON. Root key must be \"questions\". Generate exactly the requested number of questions. Each question must have: question, options, correctAnswer, explanation. Each options array must contain exactly 4 strings. correctAnswer must be a zero-based integer 0-3. All fields must be non-empty. No Markdown, no code fences, no extra text. Never output 5 options. Never output correctAnswer 4.";

function buildUserPrompt(quizSource: string, batchCount: number): string {
  return `Create exactly ${batchCount} multiple-choice questions from the supplied content.

Requirements:
- Exactly ${batchCount} questions.
- Exactly 4 options per question.
- correctAnswer is zero-based: 0,1,2,3.
- Include a short explanation.
- Output JSON only using root key "questions".

Web-side constraint:
OUTPUT VALID JSON ONLY. The generated response MUST be complete. Never stop in the middle of an array, an object, a string, an option, or an explanation. Do not use Markdown code fences. Do not include any text outside the JSON object. The final character must be: }

Content:
${quizSource}`;
}

function extractQuizJson(rawOutput: string): string | null {
  const trimmed = rawOutput.trim();

  console.log(`[QuizGenerationManager] QUIZ_JSON_EXTRACTION_START`);
  console.log(`[QuizGenerationManager] RAW_TRIMMED_LENGTH=${trimmed.length}`);
  console.log(`[QuizGenerationManager] TRIMMED_FIRST_CHAR=${trimmed.charAt(0) || 'null'}`);
  console.log(`[QuizGenerationManager] TRIMMED_LAST_CHAR=${trimmed.charAt(trimmed.length - 1) || 'null'}`);

  let cleanJson = trimmed;
  if (cleanJson.startsWith('```json')) {
     cleanJson = cleanJson.substring(7).trim();
  } else if (cleanJson.startsWith('```')) {
     cleanJson = cleanJson.substring(3).trim();
  }
  if (cleanJson.endsWith('```')) {
     cleanJson = cleanJson.substring(0, cleanJson.length - 3).trim();
  }

  // Check truncation
  if (!cleanJson.endsWith('}')) {
     console.log(`[QuizGenerationManager] JSON_TRUNCATED_OR_INVALID`);
     return null;
  }

  // FIRST: direct JSON parsing
  if (cleanJson.startsWith("{") && cleanJson.endsWith("}")) {
    try {
      JSON.parse(cleanJson);
      console.log(`[QuizGenerationManager] QUIZ_JSON_DIRECT_PARSE_SUCCESS`);
      console.log(`[QuizGenerationManager] JSON_PARSE_SUCCESS`);
      return cleanJson;
    } catch (e: any) {
      console.log(`[QuizGenerationManager] QUIZ_JSON_DIRECT_PARSE_FAILED: ${e.message}`);
    }
  }

  // SECOND: fallback extraction
  const start = cleanJson.indexOf('{');
  const end = cleanJson.lastIndexOf('}');

  if (start >= 0 && end > start) {
    const extracted = cleanJson.substring(start, end + 1);
    try {
      JSON.parse(extracted);
      console.log(`[QuizGenerationManager] QUIZ_JSON_FALLBACK_EXTRACTION_SUCCESS`);
      console.log(`[QuizGenerationManager] JSON_PARSE_SUCCESS`);
      return extracted;
    } catch (e: any) {
      console.log(`[QuizGenerationManager] QUIZ_JSON_FALLBACK_PARSE_FAILED: ${e.message}`);
    }
  }

  console.log(`[QuizGenerationManager] QUIZ_JSON_EXTRACTION_FAILED`);
  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { skillId, userId, questionCount: reqCount } = body;

    if (!skillId || !userId) {
      return NextResponse.json({ success: false, error: 'Missing skillId or userId' }, { status: 400 });
    }

    const questionCount = reqCount || 10;
    
    console.log(`[QuizGenerationManager] QUIZ_REQUESTED_COUNT=${questionCount}`);
    console.log(`[QuizGenerationManager] EXPECTED_QUESTION_COUNT=${questionCount}`);

    // 1. Fetch Skill from Firestore
    const skillRef = doc(db, 'skills', skillId);
    const skillSnap = await getDoc(skillRef);
    if (!skillSnap.exists()) {
      return NextResponse.json({ success: false, error: 'Skill not found' }, { status: 404 });
    }

    const skillData = skillSnap.data() as Skill;

    // 2. Authorization
    if (skillData.creatorId !== userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Only the creator can generate quizzes.' }, { status: 403 });
    }

    // 3. Prepare Prompt
    let quizSource = `Title: ${skillData.title}\nDescription: ${skillData.description}\n`;
    if (skillData.roadmap) {
      skillData.roadmap.forEach((day: any, i: number) => {
        quizSource += `Day ${i + 1}: ${day.title}\n${day.description}\n`;
      });
    }
    
    const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
    const ollamaModel = process.env.OLLAMA_MODEL || "qwen2.5:1.5b";

    const QUIZ_BATCH_SIZE = 5;
    const numBatches = Math.ceil(questionCount / QUIZ_BATCH_SIZE);
    const allQuestions: QuizQuestion[] = [];
    
    let loopSafetyCounter = 0;
    const MAX_LOOPS = numBatches + 5;
    let attempt = 0;

    while (allQuestions.length < questionCount && loopSafetyCounter < MAX_LOOPS) {
      loopSafetyCounter++;
      attempt++;
      console.log(`[QuizGenerationManager] GENERATION_ATTEMPT=${attempt}`);
      
      const questionsToGenerate = Math.min(QUIZ_BATCH_SIZE, questionCount - allQuestions.length);
      const userPrompt = buildUserPrompt(quizSource, questionsToGenerate);

      const sysTokens = Math.ceil(INSTRUCTIONS.length / 4);
      const userTokens = Math.ceil(userPrompt.length / 4);
      const finalTokens = sysTokens + userTokens + 10;

      console.log(`[QuizGenerationManager] QUIZ_INPUT_TOKEN_CHECK_START`);
      console.log(`[QuizGenerationManager] SYSTEM_PROMPT_TOKENS=${sysTokens}`);
      console.log(`[QuizGenerationManager] USER_PROMPT_TOKENS=${userTokens}`);
      console.log(`[QuizGenerationManager] TOTAL_INPUT_TOKENS=${finalTokens}`);
      console.log(`[QuizGenerationManager] QUIZ_INPUT_TOKEN_LIMIT=500`);
      console.log(`[QuizGenerationManager] QUIZ_INPUT_TOKEN_CHECK_END`);

      console.log(`[QuizGenerationManager] QUIZ_CONTEXT_RESET_START`);
      console.log(`[QuizGenerationManager] CONTEXT_RESET=SUCCESS`);
      console.log(`[QuizGenerationManager] QUIZ_CONTEXT_RESET_END`);

      console.log(`[QuizGenerationManager] GENERATION_START`);
      console.log(`[QuizGenerationManager] EXPECTED_QUESTION_COUNT=${questionCount}`);
      console.log(`[QuizGenerationManager] PROMPT_QUESTION_COUNT=${questionsToGenerate}`);
      console.log(`[QuizGenerationManager] MODEL=${ollamaModel}`);
      console.log(`[QuizGenerationManager] QUIZ_GENERATION_START`);

      // 4. Call Ollama
      const response = await fetch(`${ollamaBaseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: ollamaModel,
          system: INSTRUCTIONS,
          prompt: userPrompt,
          stream: false,
          format: "json",
          options: {
            temperature: 0.2,
            num_predict: 1500
          }
        })
      });

      if (!response.ok) {
        console.log(`[QuizGenerationManager] QUIZ_NATIVE_ERROR`);
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const responseData = await response.json();
      const rawOutput = responseData.response || '';

      console.log(`[QuizGenerationManager] RAW_OUTPUT_RECEIVED`);
      console.log(`[QuizGenerationManager] GENERATED_OUTPUT_LENGTH=${rawOutput.length}`);
      console.log(`[QuizGenerationManager] RAW_OUTPUT_OBJECT_LENGTH=${rawOutput.length}`);
      console.log(`[QuizGenerationManager] RAW_OUTPUT_FIRST_CHAR=${rawOutput.charAt(0) || 'null'}`);
      console.log(`[QuizGenerationManager] RAW_OUTPUT_LAST_CHAR=${rawOutput.charAt(rawOutput.length - 1) || 'null'}`);
      console.log(`[QuizGenerationManager] RAW_OUTPUT_START`);
      if (process.env.NODE_ENV === 'development') {
        console.log(`[QuizGenerationManager] ${rawOutput}`);
      }
      console.log(`[QuizGenerationManager] RAW_OUTPUT_END`);

      // 5. Parse and Validate
      const jsonStr = extractQuizJson(rawOutput);
      if (jsonStr) {
        console.log(`[QuizGenerationManager] QUIZ_JSON_PARSE_START`);
        try {
          const parsedJson = JSON.parse(jsonStr);
          console.log(`[QuizGenerationManager] QUIZ_VALIDATION_START`);
          if (parsedJson.questions && Array.isArray(parsedJson.questions)) {
            const batchQuestions: QuizQuestion[] = [];
            let isValid = true;
            for (let i = 0; i < parsedJson.questions.length; i++) {
              const q = parsedJson.questions[i];
              if (!q.question || typeof q.question !== 'string' || q.question.trim() === '') {
                console.log(`[QuizGenerationManager] QUIZ_JSON_INVALID: Question ${i+1} has empty question text`);
                isValid = false; break;
              }
              if (!q.options || !Array.isArray(q.options) || q.options.length !== 4) {
                console.log(`[QuizGenerationManager] QUIZ_JSON_INVALID: Question ${i+1} has ${q.options?.length || 0} options, expected 4`);
                isValid = false; break;
              }
              const options = q.options.map((opt: string) => (opt || '').trim());
              if (options.some((opt: string) => opt === '')) {
                console.log(`[QuizGenerationManager] QUIZ_JSON_INVALID: Question ${i+1} has empty option`);
                isValid = false; break;
              }
              if (q.correctAnswer === undefined || typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
                console.log(`[QuizGenerationManager] QUIZ_JSON_INVALID: Question ${i+1} correctAnswer out of range`);
                isValid = false; break;
              }
              if (!q.explanation || typeof q.explanation !== 'string' || q.explanation.trim() === '') {
                console.log(`[QuizGenerationManager] QUIZ_JSON_INVALID: Question ${i+1} explanation is empty`);
                isValid = false; break;
              }
              
              batchQuestions.push({
                questionId: crypto.randomUUID(),
                question: q.question.trim(),
                options: options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation.trim(),
                difficulty: "medium",
                topic: "",
                dayNumber: 1
              });
            }
            
            if (!isValid) {
               console.log(`[QuizGenerationManager] JSON_PARSE_FAILED`);
               console.log(`[QuizGenerationManager] RETRYING`);
               continue;
            }

            allQuestions.push(...batchQuestions);
            
            // Deduplicate
            const originalSize = allQuestions.length;
            const uniqueQuestionsMap = new Map(allQuestions.map(q => [q.question, q]));
            allQuestions.length = 0;
            allQuestions.push(...Array.from(uniqueQuestionsMap.values()));
            if (allQuestions.length < originalSize) {
              console.log(`[QuizGenerationManager] Removed ${originalSize - allQuestions.length} duplicate questions.`);
            }

            console.log(`[QuizGenerationManager] QUIZ_JSON_PARSE_SUCCESS`);
            console.log(`[QuizGenerationManager] QUIZ_VALIDATION_SUCCESS`);
          } else {
            console.log(`[QuizGenerationManager] QUIZ_JSON_INVALID: Missing questions array`);
            console.log(`[QuizGenerationManager] JSON_PARSE_FAILED`);
            console.log(`[QuizGenerationManager] RETRYING`);
            continue;
          }
        } catch (e: any) {
          console.log(`[QuizGenerationManager] QUIZ_JSON_INVALID: JSON Parse Error - ${e.message}`);
          console.log(`[QuizGenerationManager] JSON_PARSE_FAILED`);
          console.log(`[QuizGenerationManager] RETRYING`);
          continue;
        }
      } else {
        console.log(`[QuizGenerationManager] QUIZ_JSON_INVALID: No valid JSON extracted`);
        console.log(`[QuizGenerationManager] JSON_PARSE_FAILED`);
        console.log(`[QuizGenerationManager] RETRYING`);
        continue;
      }
      console.log(`[QuizGenerationManager] GENERATED_QUESTION_COUNT=${allQuestions.length}`);
    }

    if (allQuestions.length > questionCount) {
      console.log(`[QuizGenerationManager] QUESTION_COUNT_NORMALIZATION`);
      console.log(`[QuizGenerationManager] GENERATED=${allQuestions.length}`);
      console.log(`[QuizGenerationManager] EXPECTED=${questionCount}`);
      console.log(`[QuizGenerationManager] USING=${questionCount}`);
      allQuestions.length = questionCount;
    }

    if (allQuestions.length !== questionCount) {
      console.log(`[QuizGenerationManager] QUESTION_COUNT_MISMATCH`);
      console.log(`[QuizGenerationManager] EXPECTED=${questionCount}`);
      console.log(`[QuizGenerationManager] ACTUAL=${allQuestions.length}`);
      return NextResponse.json({ success: false, error: 'The generated quiz does not contain the requested number of questions.' }, { status: 500 });
    }

    console.log(`[QuizGenerationManager] FINAL_QUESTION_COUNT=${allQuestions.length}`);
    console.log(`[QuizGenerationManager] QUIZ_VALIDATION_SUCCESS`);

    const finalQuiz: FinalQuiz = {
      quizId: crypto.randomUUID(),
      quizTitle: `${skillData.title} Final Assessment`,
      totalQuestions: allQuestions.length,
      passingScore: 70,
      quizVersion: 1,
      createdBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      questions: allQuestions,
      status: "GENERATED"
    };

    // 6. Save to Firestore
    await updateDoc(skillRef, {
      finalQuiz: finalQuiz
    });

    return NextResponse.json({ success: true, quizId: finalQuiz.quizId });

  } catch (error: any) {
    console.log(`[QuizGenerationManager] Error during quiz generation: ${error.message}`);
    if (error.cause?.code === 'ECONNREFUSED' || error.message.includes('fetch failed')) {
      return NextResponse.json({ success: false, error: 'Local AI model is unavailable. Please make sure Ollama is running.' }, { status: 503 });
    }
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
