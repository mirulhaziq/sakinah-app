// Sakinah سكينة — Gemini AI with Persona Support
// Uses gemini-2.5-flash-lite via REST API (kept as-is per user preference)

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`
const GEMINI_STREAM_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`

function buildPayload(messages, systemPrompt) {
    const contents = messages.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
    }))

    return {
        system_instruction: {
            parts: [{ text: systemPrompt }],
        },
        contents,
        generationConfig: {
            temperature: 0.85,
            maxOutputTokens: 1500,
            topP: 0.95,
        },
        safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
    }
}

/**
 * Send messages to Gemini with persona system prompt (non-streaming)
 * @param {Array} messages - Array of {role, content} objects
 * @param {string} systemPrompt - The persona system prompt
 * @returns {Promise<string>} AI response text
 */
export async function sendToGemini(messages, systemPrompt) {
    if (!GEMINI_API_KEY) {
        throw new Error('Missing VITE_GEMINI_API_KEY in .env.local')
    }

    const payload = buildPayload(messages, systemPrompt)

    const response = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const err = await response.json()
        throw new Error(err?.error?.message || `Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) throw new Error('No response from Gemini AI')

    // Log token usage
    const usage = data?.usageMetadata
    if (usage) {
        console.log(
            '%c[Gemini Token Usage]',
            'color: #C9A96E; font-weight: bold',
            `\n  Prompt tokens:    ${usage.promptTokenCount ?? '?'}`,
            `\n  Response tokens:  ${usage.candidatesTokenCount ?? '?'}`,
            `\n  Total tokens:     ${usage.totalTokenCount ?? '?'}`
        )
    }

    return text
}

/**
 * Send messages to Gemini with streaming (SSE)
 * @param {Array} messages - Array of {role, content}
 * @param {string} systemPrompt - The persona system prompt
 * @param {function} onChunk - Callback called with each text chunk
 * @returns {Promise<string>} Full response text
 */
export async function sendToGeminiStream(messages, systemPrompt, onChunk) {
    if (!GEMINI_API_KEY) {
        throw new Error('Missing VITE_GEMINI_API_KEY in .env.local')
    }

    const payload = buildPayload(messages, systemPrompt)

    const response = await fetch(GEMINI_STREAM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const err = await response.json()
        throw new Error(err?.error?.message || `Gemini stream error: ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullText = ''

    while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const jsonStr = line.slice(6).trim()
                if (jsonStr === '[DONE]') continue
                try {
                    const parsed = JSON.parse(jsonStr)
                    const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text
                    if (text) {
                        fullText += text
                        onChunk(text)
                    }
                } catch {
                    // Skip malformed SSE lines
                }
            }
        }
    }

    return fullText
}
