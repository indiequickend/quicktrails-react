'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { verifyAdminSession } from '@/lib/dal';

// Uses gemini-2.0-flash-lite — completely free tier, no billing required.
const MODEL = 'gemini-2.5-flash-lite';

export async function generateDestinationSEO({ name, tagline = '', description = '' }) {
  await verifyAdminSession();

  if (!process.env.GEMINI_API_KEY) {
    return { success: false, error: 'GEMINI_API_KEY is not set in environment variables.' };
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL });

    // Strip HTML tags from description before sending
    const plainDesc = description.replace(/<[^>]*>/g, '').slice(0, 600).trim();

    const prompt = `You are an SEO expert for QuickTrails, an Indian travel agency. Generate SEO metadata for a destination landing page.

Destination name: ${name}
Tagline: ${tagline || 'N/A'}
Description excerpt: ${plainDesc || 'N/A'}

Return ONLY valid JSON — no markdown fences, no explanation, no extra text. Exactly this structure:
{
  "seoTitle": "...",
  "seoDescription": "...",
  "focusKeyword": "...",
  "keywords": ["...", "...", "...", "...", "..."],
  "longTailKeywords": ["...", "...", "...", "...", "...", "...", "..."]
}

Rules:
- seoTitle: 50–60 characters, include destination name, include "QuickTrails"
- seoDescription: 145–160 characters, compelling call-to-action, include destination name
- focusKeyword: single primary search phrase (e.g. "Sikkim tour packages")
- keywords: 5–7 short travel keywords for this destination
- longTailKeywords: 7 specific phrases Indian travelers actually search — include "from Kolkata/Delhi/Mumbai" variants, seasonal (month-specific), activity-based, budget vs luxury, and nearby landmark variants`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    // Strip markdown code fences if the model includes them anyway
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    // Normalise: ensure arrays
    if (!Array.isArray(parsed.keywords)) parsed.keywords = [];
    if (!Array.isArray(parsed.longTailKeywords)) parsed.longTailKeywords = [];

    return { success: true, data: parsed };
  } catch (err) {
    console.error('Gemini SEO error:', err);
    return { success: false, error: 'Failed to generate SEO. Check your API key and try again.' };
  }
}

export async function generateDestinationDescription({ name, tagline = '', parentName = '' }) {
  await verifyAdminSession();

  if (!process.env.GEMINI_API_KEY) {
    return { success: false, error: 'GEMINI_API_KEY is not set in environment variables.' };
  }

  const isCity = !!parentName;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL });

    const prompt = `You are a travel content writer for QuickTrails, an Indian travel agency. Write a detailed, SEO-optimised destination guide page for "${name}"${isCity ? `, a city/town in ${parentName}` : ', a travel destination in India'}.${tagline ? ` Tagline: "${tagline}".` : ''}

Write the content as clean HTML using ONLY these tags: <h2>, <p>, <ul>, <li>, <strong>. No <html>, <body>, <head>, <h1>, or any other tags. No markdown. No code fences. Return only the HTML content, nothing else.

Use EXACTLY this section structure in this order:

<h2>About ${name}</h2>
2 paragraphs. What makes ${name} special for travellers. Naturally use the phrase "${isCity ? `${name} travel` : `${name} tour packages`}" within the first 100 words. Mention the type of travellers it suits (families, couples, adventure seekers, etc.).

<h2>Best Time to Visit ${name}</h2>
Cover all 3 seasons (summer, monsoon, winter) with specific months. Mention which months are peak season and which offer budget deals. Include weather conditions. This captures searches like "${name} in December", "${name} monsoon travel".

<h2>How to Reach ${name}</h2>
${isCity
        ? `Distance and travel time from ${parentName}. Nearest airport, nearest railway station. Road route options. Include distance from major cities: Kolkata, Delhi, Mumbai if applicable.`
        : 'Nearest airports, major railway stations, road routes. Distance from Kolkata, Delhi, Mumbai. Include any special entry requirements like permits if applicable to this destination.'
      }
Use a <ul> list for transport options.

${!isCity ? `<h2>Places to Visit in ${name}</h2>
Key attractions, viewpoints, lakes, monasteries, towns, or sites within ${name}. Use a <ul> list. Mention 6–8 specific places by name — these are keyword-rich.

` : ''}<h2>Things to Do in ${name}</h2>
Activities travellers can enjoy: trekking, sightseeing, wildlife, water sports, cultural experiences, food, shopping — whatever is relevant. Use a <ul> list with 6–8 items.

<h2>Travel Tips for ${name}</h2>
3–4 practical tips: packing essentials, local customs, connectivity, currency, altitude considerations if relevant, safety. Use a <ul> list.

Total word count: 650–900 words. Write naturally for a human reader. Use <strong> sparingly to highlight key facts like distances, temperatures, or important names.`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    // Strip any accidental markdown fences
    const html = raw
      .replace(/^```(?:html)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();

    return { success: true, html };
  } catch (err) {
    console.error('Gemini description error:', err);
    return { success: false, error: 'Failed to generate description. Check your API key and try again.' };
  }
}
