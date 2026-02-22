import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { sendToGemini } from '../lib/gemini'

export function useChat(userId) {
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [error, setError] = useState(null)

    const loadMessages = useCallback(async () => {
        if (!userId) return
        setLoading(true)
        setError(null)
        try {
            const { data, error } = await supabase
                .from('journal_messages')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: true })

            if (error) throw error
            setMessages(data || [])
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [userId])

    useEffect(() => {
        loadMessages()
    }, [loadMessages])

    async function sendMessage(content) {
        if (!content.trim() || !userId) return
        setSending(true)
        setError(null)

        // Optimistically add user message to UI
        const tempUserMsg = {
            id: `temp-${Date.now()}`,
            user_id: userId,
            role: 'user',
            content: content.trim(),
            created_at: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, tempUserMsg])

        try {
            // 1. Save user message to Supabase
            const { data: savedUserMsg, error: userErr } = await supabase
                .from('journal_messages')
                .insert({ user_id: userId, role: 'user', content: content.trim() })
                .select()
                .single()

            if (userErr) throw userErr

            // 2. Build history for Gemini — all stored in Supabase,
            //    but only send last CONTEXT_LIMIT msgs to save tokens
            const CONTEXT_LIMIT = 40
            const allMessages = [...messages, savedUserMsg]
            const geminiHistory = allMessages
                .slice(-CONTEXT_LIMIT)
                .map((m) => ({
                    role: m.role,
                    content: m.content,
                }))

            // 3. Call Gemini with capped history
            const aiReply = await sendToGemini(geminiHistory)


            // 4. Save AI reply to Supabase
            const { data: savedAiMsg, error: aiErr } = await supabase
                .from('journal_messages')
                .insert({ user_id: userId, role: 'assistant', content: aiReply })
                .select()
                .single()

            if (aiErr) throw aiErr

            // 5. Update UI with real messages (replace temp)
            setMessages((prev) => {
                const filtered = prev.filter((m) => m.id !== tempUserMsg.id)
                return [...filtered, savedUserMsg, savedAiMsg]
            })
        } catch (err) {
            // Remove optimistic message on error
            setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id))
            setError(err.message)
        } finally {
            setSending(false)
        }
    }

    async function clearHistory() {
        try {
            const { error } = await supabase
                .from('journal_messages')
                .delete()
                .eq('user_id', userId)

            if (error) throw error
            setMessages([])
        } catch (err) {
            setError(err.message)
        }
    }

    return { messages, loading, sending, error, sendMessage, clearHistory, reload: loadMessages }
}
