// Sakinah سكينة — Contextual Quran Verses for Mood Tracker
// Used on Mood page based on user's average mood this week

export const MOOD_VERSES = {
    // Average mood >= 4 (Good / Very Good) — Gratitude (Syukur)
    high: {
        arabic: "وَإِذْ تَأَذَّنَ رَبُّكُمْ لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ وَلَئِن كَفَرْتُمْ إِنَّ عَذَابِي لَشَدِيدٌ",
        english: "And remember when your Lord proclaimed: 'If you are grateful, I will certainly give you more. But if you are ungrateful, surely My punishment is severe.'",
        malay: "Dan ingatlah ketika Tuhanmu memaklumkan: 'Sesungguhnya jika kamu bersyukur, nescaya Aku akan menambah nikmat kepadamu, tetapi jika kamu kufur, sesungguhnya azab-Ku sangat pedih.'",
        reference_en: "Surah Ibrahim (14:7)",
        reference_bm: "Surah Ibrahim (14:7)",
        theme_en: "Gratitude multiplies blessings",
        theme_bm: "Syukur melipatgandakan nikmat",
    },

    // Average mood = 3 (Neutral) — Steadfastness (Istiqamah)
    mid: {
        arabic: "إِنَّ الَّذِينَ قَالُوا رَبُّنَا اللَّهُ ثُمَّ اسْتَقَامُوا تَتَنَزَّلُ عَلَيْهِمُ الْمَلَائِكَةُ أَلَّا تَخَافُوا وَلَا تَحْزَنُوا وَأَبْشِرُوا بِالْجَنَّةِ الَّتِي كُنتُمْ تُوعَدُونَ",
        english: "Indeed, those who say 'Our Lord is Allah' and then remain steadfast — the angels descend upon them saying: 'Do not fear, and do not grieve. Receive the glad tidings of Paradise which you have been promised.'",
        malay: "Sesungguhnya orang-orang yang berkata 'Tuhan kami ialah Allah', kemudian mereka istiqamah — para malaikat turun kepada mereka berkata: 'Janganlah kamu takut dan janganlah kamu bersedih, dan bergembiralah dengan syurga yang dijanjikan kepada kamu.'",
        reference_en: "Surah Fussilat (41:30)",
        reference_bm: "Surah Fussilat (41:30)",
        theme_en: "Stay steadfast — peace awaits",
        theme_bm: "Teruskan istiqamah — ketenangan menanti",
    },

    // Average mood <= 2 (Bad / Very Bad) — Hope and Ease (Rahmat)
    low: {
        arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا",
        english: "Indeed, with hardship comes ease. Indeed, with hardship comes ease.",
        malay: "Sesungguhnya bersama kesulitan itu ada kemudahan. Sesungguhnya bersama kesulitan itu ada kemudahan.",
        reference_en: "Surah al-Inshirah (94:5-6)",
        reference_bm: "Surah al-Inshirah (94:5-6)",
        theme_en: "After every hardship comes ease",
        theme_bm: "Selepas setiap kesulitan ada kemudahan",
    },
}

/**
 * Get contextual verse based on average mood score
 * @param {number} average - Average mood (1-5)
 * @returns {object} The verse object
 */
export function getMoodVerse(average) {
    if (average >= 4) return MOOD_VERSES.high
    if (average <= 2) return MOOD_VERSES.low
    return MOOD_VERSES.mid
}
