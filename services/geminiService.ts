/**
 * REUSABLE SCORE SYNC SERVICE
 * Requirements: Gemini API Key with Search Tool enabled.
 */
import { GoogleGenAI, Type } from "@google/genai";
import { Player, Franchise } from "../types";
import { LOCAL_PLAYER_STATS } from '../constants';

/**
 * Robust JSON parsing that handles potential markdown wrappers.
 */
function safeJsonParse(text: string): any {
  if (!text) return null;
  let cleaned = text.trim();
  
  // Handle markdown blocks
  const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match && match[1]) {
    cleaned = match[1];
  }

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON parse failed:", e, "Problematic text:", cleaned);
    return null;
  }
}

// Helper for scorecard processing
export const processScorecard = async (url: string): Promise<any[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-preview';
  
  const prompt = `
    Analyze the cricket scorecard at this URL: ${url}
    
    1. EXTREMELY IMPORTANT: Identify and list ALL 22 PLAYERS who participated in the match (11 from each side).
    2. For EVERY player who participated, calculate their fantasy points using the strict algorithm below.
    3. Identify the "Player of the Match" (POTM).
    
    STRICT SCORING ALGORITHM (KCB 2026):
    - Batting: 
        * 1 point per Run.
        * +1 extra for every Four, +2 extra for every Six.
        * Duck (>= 1 ball faced): -2 points.
        * Milestones: 30 runs (+4), 50 runs (+8), 75 runs (+16), 100 runs (+32). (Take the highest applicable).
        * Strike Rate (min 10 balls): <70 (-4), 70-99.99 (-2), 130-149.9 (+2), 150-169.9 (+4), >=170 (+6).
    - Bowling: 
        * 25 points per Wicket.
        * Maiden Over: +12 points.
        * Wicket Hauls: 3 wickets (+8), 4 wickets (+16), 5 wickets (+32).
        * Economy (min 2 overs): <5 (+6), 5-5.99 (+4), 6-6.99 (+2), 9-9.99 (-2), 10-10.99 (-4), >=11 (-6).
    - Fielding: 
        * 8 points per Catch.
        * 12 points per Stumping.
        * Run-out: Direct (+12), Assisted (+6).
        * 3+ Catches in a match: +4 extra points.
    - Special: 
        * If a player is "Player of the Match", add a FLAT +100 point bonus.
    
    Provide a concise 'breakdown' string for each player showing calculations. 
    
    Output a valid JSON array of objects for EVERY player (at least 22), strictly adhering to this format:
    [{"playerName": "Name", "points": Number, "isPOTM": Boolean, "breakdown": "Breakdown String"}]
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              playerName: { type: Type.STRING },
              points: { type: Type.NUMBER },
              isPOTM: { type: Type.BOOLEAN },
              breakdown: { type: Type.STRING }
            },
            required: ["playerName", "points", "isPOTM", "breakdown"]
          }
        }
      }
    });
    return safeJsonParse(response.text) || [];
  } catch (error) {
    console.error("Gemini scorecard sync error:", error);
    return [];
  }
};

/**
 * FETCH SCOUTING REPORT FOR A PLAYER
 */
export const getScoutingReport = async (player: Player, franchises: Franchise[]): Promise<any> => {
  const localPlayerData = (LOCAL_PLAYER_STATS as Record<string, any>)[player.name];
  
  if (localPlayerData && localPlayerData['2025']) {
    const stats2025 = localPlayerData['2025'];
    const summary = `In the 2025 season, ${player.name} scored ${stats2025.RUNS} runs in ${stats2025.MAT} matches. They achieved a high score of ${stats2025.HS} and maintained a strike rate of ${stats2025.SR}.`;

    return Promise.resolve({
      summary,
      stats: {
        matches: stats2025.MAT,
        innings: stats2025.MAT,
        runs: stats2025.RUNS,
        average: stats2025.AVG,
        strike_rate: stats2025.SR,
        high_score: String(stats2025.HS),
        hundreds: stats2025['100'],
        fifties: stats2025['50'],
        wickets: null,
        economy: null,
        overs: null,
        best_bowling: null,
        four_w: null,
        five_w: null,
      }
    });
  }
  
  return Promise.resolve({
    summary: `Detailed 2025 stats for ${player.name} are not available.`,
    stats: null
  });
};
