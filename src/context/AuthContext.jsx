import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchProfile = useCallback(async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle()

            if (error) throw error
            setProfile(data)
        } catch (err) {
            console.error('Error fetching profile:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) fetchProfile(session.user.id)
            else setLoading(false)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) fetchProfile(session.user.id)
            else {
                setProfile(null)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [fetchProfile])

    async function signUp(email, password, name = '') {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error

        // Insert profile row with defaults
        if (data.user) {
            try {
                await supabase.from('profiles').insert({
                    id: data.user.id,
                    name: name || email.split('@')[0],
                    preferred_persona: 'balanced',
                    preferred_lang: localStorage.getItem('sakinah_lang') || 'bm',
                })
            } catch (profileErr) {
                console.warn('Profile creation error (may already exist):', profileErr)
            }
        }
        return data
    }

    async function signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        return data
    }

    async function signOut() {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        setUser(null)
        setProfile(null)
    }

    async function updateProfile(updates) {
        if (!user) throw new Error('Not authenticated')
        const { data, error } = await supabase
            .from('profiles')
            .upsert({ id: user.id, ...updates }, { onConflict: 'id' })
            .select()
            .single()

        if (error) throw error
        setProfile(data)
        return data
    }

    return (
        <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, updateProfile }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
