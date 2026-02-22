// Sakinah سكينة — Prayer Times Hook
// Uses Aladhan API with GPS or manual Malaysian state selection

import { useState, useEffect, useRef, useCallback } from 'react'

const MALAYSIA_STATES = {
    "Kuala Lumpur": { lat: 3.1390, lng: 101.6869 },
    "Selangor": { lat: 3.0738, lng: 101.5183 },
    "Johor": { lat: 1.4927, lng: 103.7414 },
    "Pulau Pinang": { lat: 5.4141, lng: 100.3288 },
    "Perak": { lat: 4.5921, lng: 101.0901 },
    "Kedah": { lat: 6.1184, lng: 100.3685 },
    "Kelantan": { lat: 6.1254, lng: 102.2381 },
    "Terengganu": { lat: 5.3117, lng: 103.1324 },
    "Pahang": { lat: 3.8126, lng: 103.3256 },
    "Negeri Sembilan": { lat: 2.7258, lng: 101.9424 },
    "Melaka": { lat: 2.1896, lng: 102.2501 },
    "Sabah": { lat: 5.9788, lng: 116.0753 },
    "Sarawak": { lat: 1.5533, lng: 110.3592 },
    "Perlis": { lat: 6.4449, lng: 100.2048 },
    "Putrajaya": { lat: 2.9264, lng: 101.6964 },
    "Labuan": { lat: 5.2831, lng: 115.2308 },
}

// Prayer BM/EN name mapping (ordered for next-prayer logic)
const PRAYER_ORDER = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
const PRAYER_BM_NAMES = {
    Fajr: 'Subuh',
    Sunrise: 'Syuruk',
    Dhuhr: 'Zohor',
    Asr: 'Asar',
    Maghrib: 'Maghrib',
    Isha: 'Isyak',
}

function getTodayKey() {
    const d = new Date()
    return `sakinah_prayers_${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

async function fetchTimings(lat, lng) {
    const cacheKey = getTodayKey()
    const cached = sessionStorage.getItem(cacheKey)
    if (cached) return JSON.parse(cached)

    const url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=3`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch prayer times')
    const data = await res.json()
    const timings = data.data.timings
    sessionStorage.setItem(cacheKey, JSON.stringify(timings))
    return timings
}

function parseTime(timeStr) {
    // timeStr is like "05:42" or "05:42 (MYT)"
    const clean = timeStr.split(' ')[0]
    const [h, m] = clean.split(':').map(Number)
    const now = new Date()
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0)
    return d
}

function formatCountdown(ms) {
    if (ms <= 0) return '00:00:00'
    const totalSeconds = Math.floor(ms / 1000)
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}

export function usePrayerTimes() {
    const [timings, setTimings] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [needsManualSelection, setNeedsManualSelection] = useState(false)
    const [selectedState, setSelectedState] = useState(null)
    const [nextPrayer, setNextPrayer] = useState(null)
    const [countdown, setCountdown] = useState('')
    const intervalRef = useRef(null)

    const load = useCallback(async (lat, lng) => {
        setLoading(true)
        setError(null)
        try {
            const t = await fetchTimings(lat, lng)
            setTimings(t)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    // Request GPS on mount
    useEffect(() => {
        if (!navigator.geolocation) {
            setNeedsManualSelection(true)
            setLoading(false)
            return
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => load(pos.coords.latitude, pos.coords.longitude),
            () => {
                setNeedsManualSelection(true)
                setLoading(false)
            },
            { timeout: 8000 }
        )
    }, [load])

    // Load when manual state selected
    useEffect(() => {
        if (selectedState && MALAYSIA_STATES[selectedState]) {
            const { lat, lng } = MALAYSIA_STATES[selectedState]
            setNeedsManualSelection(false)
            load(lat, lng)
        }
    }, [selectedState, load])

    // Countdown timer
    useEffect(() => {
        if (!timings) return

        function tick() {
            const now = new Date()
            const prayerTimes = PRAYER_ORDER.map(name => {
                const apiKey = name === 'Isha' ? 'Isha' : name === 'Sunrise' ? 'Sunrise' : name
                return { name, time: parseTime(timings[apiKey] || '00:00') }
            }).filter(p => p.time > now)

            if (prayerTimes.length > 0) {
                const next = prayerTimes[0]
                setNextPrayer(next.name)
                setCountdown(formatCountdown(next.time - now))
            } else {
                // All prayers done today — Fajr tomorrow
                setNextPrayer('Fajr')
                const tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate() + 1)
                const fajrParts = (timings['Fajr'] || '05:00').split(':').map(Number)
                tomorrow.setHours(fajrParts[0], fajrParts[1], 0, 0)
                setCountdown(formatCountdown(tomorrow - now))
            }
        }

        tick()
        intervalRef.current = setInterval(tick, 1000)
        return () => clearInterval(intervalRef.current)
    }, [timings])

    function retry() {
        sessionStorage.removeItem(getTodayKey())
        if (!navigator.geolocation) {
            setNeedsManualSelection(true)
            return
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => load(pos.coords.latitude, pos.coords.longitude),
            () => setNeedsManualSelection(true),
            { timeout: 8000 }
        )
    }

    return {
        timings,
        loading,
        error,
        needsManualSelection,
        selectedState,
        setSelectedState,
        nextPrayer,
        countdown,
        prayerOrder: PRAYER_ORDER,
        prayerBMNames: PRAYER_BM_NAMES,
        stateList: Object.keys(MALAYSIA_STATES),
        retry,
    }
}
