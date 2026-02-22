import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import { ThemeProvider } from './context/ThemeContext'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import ChatPage from './pages/ChatPage'
import JournalPage from './pages/JournalPage'
import MoodPage from './pages/MoodPage'

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()
    if (loading) {
        return (
            <div style={{
                minHeight: '100vh', background: 'var(--bg-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <div style={{ textAlign: 'center', animation: 'sakinahSlideUp 0.4s ease' }}>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: 'var(--accent)', marginBottom: 6 }}>Sakinah</p>
                    <p style={{ fontFamily: "'Noto Naskh Arabic', serif", fontSize: 18, color: 'var(--text-muted)', direction: 'rtl' }}>سكينة</p>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 20 }}>
                        {[0, 1, 2].map(i => (
                            <span key={i} style={{
                                width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)',
                                display: 'inline-block',
                                animation: 'sakinahBounce 1.2s infinite',
                                animationDelay: `${i * 0.2}s`,
                            }} />
                        ))}
                    </div>
                </div>
            </div>
        )
    }
    return user ? children : <Navigate to="/auth" replace />
}

function PublicRoute({ children }) {
    const { user, loading } = useAuth()
    if (loading) return null
    return user ? <Navigate to="/dashboard" replace /> : children
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/journal" element={<ProtectedRoute><JournalPage /></ProtectedRoute>} />
            <Route path="/mood" element={<ProtectedRoute><MoodPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    )
}

export default function App() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <LanguageProvider>
                    <AuthProvider>
                        <AppRoutes />
                    </AuthProvider>
                </LanguageProvider>
            </ThemeProvider>
        </BrowserRouter>
    )
}
