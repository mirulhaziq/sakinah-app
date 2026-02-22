const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`

const SYSTEM_INSTRUCTION = `You are a wise, empathetic, and Stoic-inspired AI journal companion. Your name is Marcus (after Marcus Aurelius).

Your core purpose:
- You remember EVERYTHING the user has shared with you across all their journal entries
- You provide personalized, thoughtful advice based on their FULL history
- When they're having a bad day, you offer genuine Stoic wisdom and actionable comfort
- You notice patterns in their entries and gently reflect them back
- You celebrate their wins and hold space for their struggles

Your personality:
- Warm but grounded — like a wise friend, not a therapist
- Reference past entries naturally ("I remember when you mentioned...")
- Ask thoughtful follow-up questions to deepen reflection
- Offer one Stoic quote when truly relevant (not every message)
- Be concise — 2-4 paragraphs max unless they ask for more

Stoic principles you embody:
- Focus on what's within our control
- Each day is a new beginning
- Obstacles are opportunities for growth
- Emotions are valid, responses are chosen

IMPORTANT: You have access to the user's full journal history below. Reference it naturally and thoughtfully. Never say you "don't have memory" — you do.`

export async function sendToGemini(messages) {
    if (!GEMINI_API_KEY) {
        throw new Error('Missing VITE_GEMINI_API_KEY in .env.local')
    }

    // Convert messages to Gemini format
    const contents = messages.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
    }))

    const payload = {
        system_instruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }],
        },
        contents,
        generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 1024,
            topP: 0.95,
        },
        safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
    }

    const response = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error?.error?.message || `Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) throw new Error('No response from Gemini AI')

    // Log token usage per message to console
    const usage = data?.usageMetadata
    if (usage) {
        console.log(
            `%c[Gemini Token Usage]`,
            'color: #a855f7; font-weight: bold',
            `\n  Prompt tokens:    ${usage.promptTokenCount ?? '?'}`,
            `\n  Response tokens:  ${usage.candidatesTokenCount ?? '?'}`,
            `\n  Total tokens:     ${usage.totalTokenCount ?? '?'}`,
        )
    }

    return text
}
