import { QuizQuestion, SpiritualImpression } from "../types";

export interface QuizGenerationResult {
  questions: QuizQuestion[];
  totalQuestions: number;
}

export interface QuizGenerationError {
  error: string;
}

/**
 * Generate AI-powered quiz questions based on spiritual impressions or custom prompt
 * @param input Either an array of impressions or a custom prompt string
 * @param questionCount Number of questions to generate (default: 5)
 * @returns Promise with quiz questions or error
 */
export async function generateQuiz(
  input: SpiritualImpression[] | string,
  questionCount: number = 5
): Promise<QuizGenerationResult | QuizGenerationError> {
  const openAIKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!openAIKey) {
    return { error: "OpenAI API key is not provided" };
  }

  // Check if input is valid
  if (!input) {
    return { error: "No input provided" };
  }

  const isCustomPrompt = typeof input === "string";

  if (!isCustomPrompt && (!Array.isArray(input) || input.length === 0)) {
    return { error: "No impressions provided" };
  }

  if (isCustomPrompt && input.trim().length === 0) {
    return { error: "Custom prompt cannot be empty" };
  }

  try {
    let prompt: string;

    if (isCustomPrompt) {
      // Handle custom prompt
      prompt = `Generate ${questionCount} quiz questions about "${input}" from the perspective of The Church of Jesus Christ of Latter-day Saints doctrine and teachings. Each question should be multiple choice with 4 options.

The questions should focus on:
- Scriptural references and teachings
- Doctrine and principles taught by the Church
- Historical context and events
- Prophetic teachings and revelations
- Application of gospel principles

Please format the response as a JSON array where each question has:
- question: string
- options: array of 4 strings
- correctAnswer: number (0-3, index of the correct option)

Make the questions thoughtful and doctrinally accurate according to LDS teachings. Include specific scriptural references where appropriate.`;
    } else {
      // Handle impressions (existing logic)
      const impressions = input as SpiritualImpression[];
      prompt = `Based on these spiritual impressions and experiences, generate ${questionCount} quiz questions that test understanding and recall of the content. Each question should be multiple choice with 4 options.

Impressions:
${impressions
  .map(
    (imp, index) =>
      `${index + 1}. ${imp.description} (Categories: ${
        imp.categories?.join(", ") || "None"
      })`
  )
  .join("\n")}

Please format the response as a JSON array where each question has:
- question: string
- options: array of 4 strings
- correctAnswer: number (0-3, index of the correct option)

Make the questions thoughtful and test both specific details and broader spiritual insights from the impressions.`;
    }

    // Retry logic for handling temporary API issues
    let lastError: Error | null = null;
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 1) {
          // Wait with exponential backoff before retry
          const delay = baseDelay * Math.pow(2, attempt - 1);
          console.log(
            `Retrying OpenAI request (attempt ${attempt}/${maxRetries}) after ${delay}ms delay...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        const response = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${openAIKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content: isCustomPrompt
                    ? "You are a knowledgeable assistant specializing in The Church of Jesus Christ of Latter-day Saints doctrine, scriptures, and teachings. Create thoughtful quiz questions that are doctrinally accurate and educational. Always respond with valid JSON."
                    : "You are a helpful assistant that creates thoughtful quiz questions about spiritual experiences and insights. Always respond with valid JSON.",
                },
                {
                  role: "user",
                  content: prompt,
                },
              ],
              temperature: 0.7,
              max_tokens: 2000,
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          const error = new Error(
            `OpenAI API error: ${response.status} ${response.statusText}${
              errorText ? ` - ${errorText}` : ""
            }`
          );

          // For 503 (service unavailable) and 429 (rate limit), retry
          if (
            (response.status === 503 || response.status === 429) &&
            attempt < maxRetries
          ) {
            lastError = error;
            console.warn(
              `OpenAI API temporary error (${response.status}), will retry...`
            );
            continue;
          }

          throw error;
        }

        // If we get here, the request was successful
        const data = await response.json();

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          throw new Error("Invalid response from OpenAI API");
        }

        const messageContent = data.choices[0].message.content;
        console.log("Raw OpenAI response content:", messageContent);

        if (!messageContent) {
          throw new Error("Empty response from OpenAI API");
        }

        // Try to extract JSON from the response in case it's wrapped in markdown
        let jsonContent = messageContent;
        const jsonMatch = messageContent.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonContent = jsonMatch[1];
        } else {
          // Look for array brackets and try to extract just the JSON part
          const arrayMatch = messageContent.match(/\[[\s\S]*\]/);
          if (arrayMatch) {
            jsonContent = arrayMatch[0];
          }
        }

        console.log("Parsed JSON content:", jsonContent);

        const quizQuestions = JSON.parse(jsonContent);

        // Validate the response format
        if (!Array.isArray(quizQuestions)) {
          throw new Error("OpenAI response is not an array");
        }

        // Validate each question
        for (let i = 0; i < quizQuestions.length; i++) {
          const question = quizQuestions[i];
          if (
            !question.question ||
            !Array.isArray(question.options) ||
            typeof question.correctAnswer !== "number"
          ) {
            console.warn(`Invalid question format at index ${i}:`, question);
            throw new Error(`Invalid question format at index ${i}`);
          }
        }

        return {
          questions: quizQuestions,
          totalQuestions: quizQuestions.length,
        };
      } catch (error) {
        lastError = error as Error;

        // If it's not a retryable error or we're on the last attempt, break
        if (
          attempt === maxRetries ||
          !(error instanceof Error && error.message.includes("503"))
        ) {
          break;
        }
      }
    }

    // If we get here, all retries failed
    console.error("Error generating quiz after retries:", lastError);
    const errorMessage = lastError?.message || "Failed to generate quiz";

    if (errorMessage.includes("503")) {
      return {
        error:
          "OpenAI service is temporarily unavailable. Please try again in a few moments.",
      };
    } else if (errorMessage.includes("429")) {
      return {
        error: "API rate limit exceeded. Please try again in a few moments.",
      };
    } else {
      return {
        error: errorMessage,
      };
    }
  } catch (error) {
    console.error("Error generating quiz:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to generate quiz",
    };
  }
}
