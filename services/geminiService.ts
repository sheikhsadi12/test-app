import { GoogleGenAI, Chat } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are an expert Study Assistant and Note Taker.

Your Goal: Create clean, organized, and exam-ready study notes based ONLY on the highlighted/marked text in the provided document pages.

**Initial Processing Rules:**
1. **Scan**: Visually identify text that is highlighted, underlined, red-circled, or hand-marked across ALL pages. Ignore standard text unless it's essential context.
2. **Extract & Organize**: Convert this into a structured note format (Headers, Bullets, Bold keywords).
3. **Language Strictness**:
   - **Do NOT Translate**: Keep Arabic in Arabic, English in English.
   - **Mixed Language**: Preserve the flow exactly.
4. **Cleanup**: Fix OCR errors, remove filler words.

**Chat & Command Rules:**
- The user may give follow-up instructions (e.g., "Format as a table", "Summarize this part").
- You must perform these actions on the *extracted text* or based on the visual context if asked.
- Always output CLEAN, formatted Markdown.
- NO <mark> tags. NO background colors.
`;

// Helper to get the AI client lazily.
// This prevents the "White Screen" crash if the API key is missing at startup.
const getAiClient = (): GoogleGenAI => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your GitHub Secrets and Build Workflow configuration.");
  }
  
  return new GoogleGenAI({ apiKey });
};

// Initialize a chat session
export const initializeChatSession = (): Chat => {
  const ai = getAiClient();
  const modelId = "gemini-3-flash-preview";
  
  return ai.chats.create({
    model: modelId,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });
};

// Send images for analysis (The "Process" action)
export const sendImageAnalysisRequest = async (
  chat: Chat,
  images: { base64: string; mimeType: string }[],
  includeBangla: boolean
): Promise<string> => {
  try {
    let prompt = "Please analyze these pages and extract the notes as per instructions.";
    if (includeBangla) {
      prompt += `\n\nAdditionally, add a horizontal rule (---) at the bottom and provide a section titled "## Bangla Explanation" where you explain the key concepts in Bengali.`;
    }

    const parts: any[] = images.map((img) => ({
      inlineData: {
        mimeType: img.mimeType,
        data: img.base64,
      },
    }));

    parts.push({ text: prompt });

    // The SDK accepts an object with a 'message' property
    const response = await chat.sendMessage({
      message: parts,
    });

    return response.text || "No text extracted.";
  } catch (error: any) {
    console.error("Gemini Image Analysis Error:", error);
    throw new Error(error.message || "Failed to analyze documents");
  }
};

// Send a standard text message
export const sendChatMessage = async (
  chat: Chat,
  message: string
): Promise<string> => {
  try {
    const response = await chat.sendMessage({
      message: message,
    });
    return response.text || "I couldn't generate a response.";
  } catch (error: any) {
    console.error("Gemini Message Error:", error);
    throw new Error(error.message || "Failed to send message");
  }
};