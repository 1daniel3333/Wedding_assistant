
import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { MODEL_TEXT, MODEL_IMAGE, SYSTEM_INSTRUCTION } from "../constants";
import { Message } from "../types";

// DO: Removed global ai variable to follow the guideline: "Create a new GoogleGenAI instance right before making an API call".

export async function chatWithAssistant(messages: Message[], images?: string[]): Promise<string> {
  // DO: Initialize with process.env.API_KEY inside the function
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const contents: any[] = messages.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }));

  // If there are fresh images uploaded in the last message, attach them to the model's context
  if (images && images.length > 0) {
    const lastContent = contents[contents.length - 1];
    images.forEach(base64 => {
      lastContent.parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64.split(',')[1] // extract pure base64 data
        }
      });
    });
  }

  const response = await ai.models.generateContent({
    model: MODEL_TEXT,
    contents,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
  });

  // DO: Access the .text property directly
  return response.text || "I'm sorry, I couldn't process that.";
}

export async function generateWeddingImage(prompt: string, referenceImages?: string[]): Promise<string | null> {
  // DO: Initialize with process.env.API_KEY inside the function
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const parts: Part[] = [{ text: prompt }];

  if (referenceImages && referenceImages.length > 0) {
    referenceImages.forEach(img => {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: img.split(',')[1]
        }
      });
    });
  }

  const response = await ai.models.generateContent({
    model: MODEL_IMAGE,
    contents: { parts },
    config: {
      imageConfig: {
        aspectRatio: "3:4",
      }
    }
  });

  // DO: Iterate through parts to find the image part
  if (response.candidates && response.candidates[0].content.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }

  return null;
}

export async function editWeddingImage(baseImage: string, editPrompt: string): Promise<string | null> {
    // DO: Initialize with process.env.API_KEY inside the function
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: MODEL_IMAGE,
      contents: {
        parts: [
          {
            inlineData: {
              data: baseImage.split(',')[1],
              mimeType: 'image/png',
            },
          },
          {
            text: editPrompt,
          },
        ],
      },
    });

    // DO: Iterate through parts to find the image part
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
}
