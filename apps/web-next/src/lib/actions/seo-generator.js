'use server';

import Anthropic from '@anthropic-ai/sdk';
import { verifyAdminSession } from '@/lib/dal';

const MODEL = 'claude-haiku-4-5';

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export async function generateDestinationSEO({ name, tagline = '', description = '' }) {
  await verifyAdminSession();

  if (!process.env.ANTHROPIC_API_KEY) {
    return { success: false, error: 'ANTHROPIC_API_KEY is not set in environment variables.' };
  }

  try {
    const client = getClient();
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
- seoDescription: 145–160 characters, compelling call-to-action, include destination name — write it like a human travel copywriter, not a robot
- focusKeyword: single primary search phrase (e.g. "Sikkim tour packages")
- keywords: 5–7 short travel keywords for this destination
- longTailKeywords: 7 specific phrases Indian travelers actually search — include "from Kolkata/Delhi/Mumbai" variants, seasonal (month-specific), activity-based, budget vs luxury, and nearby landmark variants
- Avoid generic filler words like "vibrant", "nestled", "boasts", "tapestry", "breathtaking"`;

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = response.content[0].text.trim();
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed.keywords)) parsed.keywords = [];
    if (!Array.isArray(parsed.longTailKeywords)) parsed.longTailKeywords = [];

    return { success: true, data: parsed };
  } catch (err) {
    console.error('Claude SEO error:', err);
    return { success: false, error: 'Failed to generate SEO. Check your API key and try again.' };
  }
}

export async function generateDestinationDescription({ name, tagline = '', parentName = '' }) {
  await verifyAdminSession();

  if (!process.env.ANTHROPIC_API_KEY) {
    return { success: false, error: 'ANTHROPIC_API_KEY is not set in environment variables.' };
  }

  const isCity = !!parentName;

  try {
    const client = getClient();

    const prompt = `You are a travel writer for QuickTrails, an Indian travel agency. Write a destination guide for "${name}"${isCity ? `, a city/town in ${parentName}` : ', a travel destination in India'}.${tagline ? ` Tagline: "${tagline}".` : ''}

Write as a knowledgeable travel writer — specific, practical, and direct. Use short and long sentences naturally. Avoid these overused AI phrases: "nestled", "boasts", "vibrant", "tapestry", "treasure", "breathtaking", "stunning", "testament", "in conclusion", "it's worth noting", "delve", "rich history", "plethora". Write like a person, not a content generator.

Output clean HTML using ONLY: <h2>, <p>, <ul>, <li>, <strong>. No <html>, <body>, <h1>, or other tags. No markdown. No code fences. Return only the HTML.

Use EXACTLY this section order:

<h2>About ${name}</h2>
2 paragraphs. What kind of place is this, what does it offer travellers. Naturally include "${isCity ? `${name} travel` : `${name} tour packages`}" within the first 100 words. Mention who it suits — families, couples, solo travellers, etc.

<h2>Best Time to Visit ${name}</h2>
Cover summer, monsoon, and winter with specific months. Mention peak season and off-season deals. Include weather. Captures searches like "${name} in December", "${name} monsoon travel".

<h2>How to Reach ${name}</h2>
${isCity
      ? `Travel time and distance from ${parentName}. Nearest airport and railway station. Road options. Distance from Kolkata, Delhi, Mumbai where applicable.`
      : 'Nearest airports, major railway stations, road routes. Distance from Kolkata, Delhi, Mumbai. Note any permits required if applicable.'
    }
Use a <ul> list for transport modes.

${!isCity ? `<h2>Places to Visit in ${name}</h2>
Key attractions inside ${name} — viewpoints, lakes, monasteries, towns, heritage sites. <ul> list with 6–8 specific named places.

` : ''}<h2>Things to Do in ${name}</h2>
Activities travellers actually do: trekking, sightseeing, wildlife, food, culture, adventure sports — whatever fits. <ul> list with 6–8 items.

<h2>Travel Tips for ${name}</h2>
3–4 practical tips: packing, local customs, connectivity, currency, altitude if relevant, safety. <ul> list.

Target 650–900 words total. Use <strong> sparingly for key facts like distances, temperatures, or important place names.`;

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = response.content[0].text.trim();
    const html = raw
      .replace(/^```(?:html)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();

    return { success: true, html };
  } catch (err) {
    console.error('Claude description error:', err);
    return { success: false, error: 'Failed to generate description. Check your API key and try again.' };
  }
}
