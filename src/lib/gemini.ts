import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface GenerationResult {
  productAnalysis: {
    isWinning: boolean;
    confidence: number;
    suggestedPrice: string;
    pricingStrategy: string;
    profitBreakdown: {
      productCost: string;
      estShipping: string;
      estAdSpend: string;
      estRTO: string;
      netProfit: string;
    };
    targetAudience: string;
    reasoning: string;
  };
  hooks: string[];
  adCopy: {
    primaryText: string;
    headline: string;
    description: string;
  };
  offerIdeas: string[];
  landingPage: {
    headline: string;
    benefits: string[];
    sections: { title: string; content: string }[];
  };
  whatsappFunnel: {
    firstMessage: string;
    followUps: string[];
    closingMessage: string;
  };
}

export async function generateCODContent(
  country: string,
  productCost: string,
  images: string[],
  customExchangeRate?: string,
  productDescription?: string
): Promise<GenerationResult> {
  const prompt = `
    You are an expert COD (Cash on Delivery) e-commerce strategist for the MENA region (specifically ${country}).
    Analyze the provided product images (and description if available) and generate a complete marketing kit.
    
    Product Details:
    - Target Country: ${country}
    - Product Cost (Price per unit from supplier in USD $): ${productCost}
    ${customExchangeRate ? `- CUSTOM EXCHANGE RATE: 1 USD = ${customExchangeRate} ${country} currency.` : ""}
    ${productDescription ? `- Provided Description: ${productDescription}` : "- No description provided. Identify the product from the images."}
    
    CRITICAL INSTRUCTION:
    Identify exactly what the product is from the images. Analyze its features, quality, and appeal to the ${country} market.
    
    CRITICAL PRICING & PROFIT CALCULATION RULES:
    1. Convert the Product Cost from USD to ${country} local currency. 
       ${customExchangeRate ? `USE THE CUSTOM EXCHANGE RATE PROVIDED: 1 USD = ${customExchangeRate}.` : `Use current approximate market exchange rates for ${country}.`}
    2. The "Suggested Price" MUST be calculated as: (Product Cost in local currency) + Estimated Shipping + Estimated Ad Spend + RTO Risk Buffer + Desired Profit.
    3. Estimated Shipping for ${country} is usually around 35-50 local currency.
    4. Estimated Ad Spend (CPA) is usually around 30-60 local currency.
    5. RTO Risk Buffer: Add at least 15-20% of the total cost to cover returns.
    6. Net Profit: Aim for a healthy margin (at least 60-100 local currency per unit).
    7. Suggested Price should end in 9 (e.g., 199, 249, 299).
    
    Generate the following in JSON format:
    1. Product Analysis: 
       - isWinning: boolean
       - confidence: number (0-100)
       - suggestedPrice: The final price for the customer in local currency.
       - pricingStrategy: Explanation of why this price works, mentioning the USD to local conversion ${customExchangeRate ? `using the rate of ${customExchangeRate}` : ""}.
       - profitBreakdown: { productCost, estShipping, estAdSpend, estRTO, netProfit } (All values in ${country} currency).
       - targetAudience: Who to target.
       - reasoning: Overall market analysis based on the images.
    2. Hooks: 10 scroll-stopping hooks.
    3. Ad Copy: Primary text, headline, and description.
    4. Offer Ideas: 3-5 bundles to increase AOV.
    5. Landing Page: Headline, 5 benefits, 3 sections.
    6. WhatsApp Funnel: First message, 2 follow-ups, closing message.
    
    Language: 
    - If the Target Country is an Arabic-speaking country (like Libya, Morocco, Algeria, Egypt, Saudi Arabia, UAE), the results MUST be written in ARABIC.
    - Use the local dialect of ${country} for the Hooks, Ad Copy, and WhatsApp Funnel to make it sound natural and persuasive to local customers.
    - Use professional Arabic for the Landing Page and Product Analysis.
    - Keep technical marketing terms in English if necessary, but the primary content must be Arabic.
  `;

  const contents: any[] = [{ text: prompt }];
  
  images.forEach((imgData) => {
    contents.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imgData.split(",")[1],
      },
    });
  });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: contents },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          productAnalysis: {
            type: Type.OBJECT,
            properties: {
              isWinning: { type: Type.BOOLEAN },
              confidence: { type: Type.NUMBER },
              suggestedPrice: { type: Type.STRING },
              pricingStrategy: { type: Type.STRING },
              profitBreakdown: {
                type: Type.OBJECT,
                properties: {
                  productCost: { type: Type.STRING },
                  estShipping: { type: Type.STRING },
                  estAdSpend: { type: Type.STRING },
                  estRTO: { type: Type.STRING },
                  netProfit: { type: Type.STRING },
                },
                required: ["productCost", "estShipping", "estAdSpend", "estRTO", "netProfit"],
              },
              targetAudience: { type: Type.STRING },
              reasoning: { type: Type.STRING },
            },
            required: ["isWinning", "confidence", "suggestedPrice", "pricingStrategy", "profitBreakdown", "targetAudience", "reasoning"],
          },
          hooks: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          adCopy: {
            type: Type.OBJECT,
            properties: {
              primaryText: { type: Type.STRING },
              headline: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ["primaryText", "headline", "description"],
          },
          offerIdeas: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          landingPage: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              benefits: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              sections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    content: { type: Type.STRING },
                  },
                  required: ["title", "content"],
                },
              },
            },
            required: ["headline", "benefits", "sections"],
          },
          whatsappFunnel: {
            type: Type.OBJECT,
            properties: {
              firstMessage: { type: Type.STRING },
              followUps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              closingMessage: { type: Type.STRING },
            },
            required: ["firstMessage", "followUps", "closingMessage"],
          },
        },
        required: [
          "productAnalysis",
          "hooks",
          "adCopy",
          "offerIdeas",
          "landingPage",
          "whatsappFunnel",
        ],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}
