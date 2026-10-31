import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'

const menu = [
    { ruta: '/', texto: 'Inicio' },
    { ruta: '/solicitudes', texto: 'Solicitudes' },
    { ruta: '/asignaciones', texto: 'Asignaciones' },
    { ruta: '/viajes', texto: 'Viajes' },
    { ruta: '/alertas', texto: 'Alertas' },
    { ruta: '/reportes', texto: 'Reportes' },
]

export default function Layout() {
    const auth = useAuth()

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <nav style={{ width: 220, padding: 16, borderRight: '1px solid #ddd' }}>
                <h3>FlowRide</h3>
                {menu.map(m => (
                    <div key={m.ruta}><NavLink to={m.ruta}>{m.texto}</NavLink></div>
                ))}
            </nav>
            <main style={{ flex: 1 }}>
                <header style={{ padding: 16, borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{auth.user?.profile.preferred_username}</span>
                    <button onClick={() => auth.signoutRedirect()}>Salir</button>
                </header>
                <div style={{ padding: 24 }}><Outlet /></div>
            </main>
        </div>
    )
}