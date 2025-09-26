import { QuizQuestion, SpiritualImpression } from "../types";

export interface QuizGenerationResult {
  questions: QuizQuestion[];
  totalQuestions: number;
}

export interface QuizGenerationError {
  error: string;
}

/**
 * Generate AI-powered quiz questions based on spiritual impressions
 * @param impressions Array of impressions to generate questions from
 * @param questionCount Number of questions to generate (default: 5)
 * @param openAIKey OpenAI API key
 * @returns Promise with quiz questions or error
 */
export async function generateQuiz(
  impressions: SpiritualImpression[],
  questionCount: number = 5
): Promise<QuizGenerationResult | QuizGenerationError> {
  const openAIKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!openAIKey) {
    return { error: "OpenAI API key is not provided" };
  }

  if (!impressions || !Array.isArray(impressions) || impressions.length === 0) {
    return { error: "No impressions provided" };
  }

  try {
    const prompt = `Based on these spiritual impressions and experiences, generate ${questionCount} quiz questions that test understanding and recall of the content. Each question should be multiple choice with 4 options.

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

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
            content:
              "You are a helpful assistant that creates thoughtful quiz questions about spiritual experiences and insights. Always respond with valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText}`
      );
    }

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
    console.error("Error generating quiz:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to generate quiz",
    };
  }
}
