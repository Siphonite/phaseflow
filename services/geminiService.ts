
import { GoogleGenAI, Type } from "@google/genai";
import { Project } from "../types";

export const architectProject = async (prompt: string): Promise<Partial<Project>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Architect a detailed project plan for: "${prompt}". 
    Break it down into logical sequential phases, and each phase into actionable steps.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          phases: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                steps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["title", "steps"]
            }
          }
        },
        required: ["title", "description", "phases"]
      }
    }
  });

  try {
    const rawData = JSON.parse(response.text);
    return {
      title: rawData.title,
      description: rawData.description,
      phases: rawData.phases.map((p: any, pIdx: number) => ({
        id: `phase-${pIdx}-${Date.now()}`,
        title: p.title,
        steps: p.steps.map((s: string, sIdx: number) => ({
          id: `step-${pIdx}-${sIdx}-${Date.now()}`,
          title: s,
          completed: false
        }))
      }))
    };
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Could not architect project structure.");
  }
};
