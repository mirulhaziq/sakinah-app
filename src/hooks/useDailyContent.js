// Sakinah سكينة — Daily Content Hook
// Deterministic daily Quran ayah + daily hadith

import { useState, useEffect } from 'react'
import { HADITH_COLLECTION } from '../data/hadith'

function getDayOfYear() {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 0)
    const diff = now - start
    const oneDay = 1000 * 60 * 60 * 24
    return Math.floor(diff / oneDay)
}

async function fetchAyah(number) {
    const [arabicRes, malayRes] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/ayah/${number}/quran-uthmani`),
        fetch(`https://api.alquran.cloud/v1/ayah/${number}/ms.basmeih`),
    ])

    if (!arabicRes.ok || !malayRes.ok) {
        throw new Error('Failed to fetch Quran ayah')
    }

    const [arabicData, malayData] = await Promise.all([
        arabicRes.json(),
        malayRes.json(),
    ])

    const ar = arabicData.data
    const ms = malayData.data

    return {
        arabic: ar.text,
        malay: ms.text,
        surahNameEn: ar.surah.englishName,
        surahNameAr: ar.surah.name,
        numberInSurah: ar.numberInSurah,
        surahNumber: ar.surah.number,
        referenceEn: `Surah ${ar.surah.englishName} (${ar.surah.number}:${ar.numberInSurah})`,
        referenceBm: `Surah ${ar.surah.englishName} (${ar.surah.number}:${ar.numberInSurah})`,
    }
}

export function useDailyContent() {
    const [ayah, setAyah] = useState(null)
    const [hadith, setHadith] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const dayOfYear = getDayOfYear()

        // Set hadith (no API needed)
        setHadith(HADITH_COLLECTION[dayOfYear % HADITH_COLLECTION.length])

        // Clear old ayah cache keys
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && key.startsWith('sakinah_ayah_') && key !== `sakinah_ayah_${dayOfYear}`) {
                localStorage.removeItem(key)
            }
        }

        // Check cache for ayah
        const cacheKey = `sakinah_ayah_${dayOfYear}`
        const cached = localStorage.getItem(cacheKey)
        if (cached) {
            try {
                setAyah(JSON.parse(cached))
                setLoading(false)
                return
            } catch {
                localStorage.removeItem(cacheKey)
            }
        }

        // Fetch fresh
        const ayahNumber = (dayOfYear % 6236) + 1
        setLoading(true)
        setError(null)
        fetchAyah(ayahNumber)
            .then(data => {
                setAyah(data)
                localStorage.setItem(cacheKey, JSON.stringify(data))
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    return { ayah, hadith, loading, error }
}
