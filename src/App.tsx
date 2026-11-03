import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from 'react-oidc-context'
import Layout from './componentes/Layout'
import Dashboard from './modulos/dashboard/DashBoard.tsx'
import Solicitudes from './modulos/solicitudes/Solicitudes.tsx'
import Asignaciones from './modulos/asignaciones/Asignaciones.tsx'
import Viajes from './modulos/viajes/Viajes.tsx'
import Alertas from './modulos/alertas/Alertas.tsx'

const cliente = new QueryClient()

export default function App() {
    const auth = useAuth()

    if (auth.isLoading) return <div className="acceso-formulario"><p>Cargando…</p></div>
    if (!auth.isAuthenticated) {
        return (
            <div className="acceso">
                <aside className="acceso-marca">
                    <div className="logo"><span className="logo-marca">F</span>FlowRide</div>
                    <div>
                        <h2>Transporte corporativo, coordinado en un solo lugar</h2>
                        <p>Programa, asigna y supervisa los servicios de tu operación.</p>
                        <ul>
                            <li>Itinerarios cargados por WhatsApp</li>
                            <li>Asignación automática de conductores</li>
                            <li>Seguimiento y alertas en tiempo real</li>
                        </ul>
                    </div>
                    <small>© FlowRide</small>
                </aside>
                <div className="acceso-formulario">
                    <div className="acceso-tarjeta">
                        <h1>Iniciar sesión</h1>
                        <p>Accede al panel del operador logístico</p>
                        <button className="primario" onClick={() => auth.signinRedirect()}>Continuar</button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <QueryClientProvider client={cliente}>
            <BrowserRouter>
                <Routes>
                    <Route element={<Layout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="solicitudes" element={<Solicitudes />} />
                        <Route path="asignaciones" element={<Asignaciones />} />
                        <Route path="viajes" element={<Viajes />} />
                        <Route path="alertas" element={<Alertas />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    )
}