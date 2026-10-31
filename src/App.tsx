import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from 'react-oidc-context'
import Layout from './componentes/Layout'
import Dashboard from './modulos/dashboard/DashBoard.tsx'

const cliente = new QueryClient()

export default function App() {
    const auth = useAuth()

    if (auth.isLoading) return <p>Cargando…</p>
    if (!auth.isAuthenticated) return <button onClick={() => auth.signinRedirect()}>Iniciar sesión</button>

    return (
        <QueryClientProvider client={cliente}>
            <BrowserRouter>
                <Routes>
                    <Route element={<Layout />}>
                        <Route index element={<Dashboard />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    )
}