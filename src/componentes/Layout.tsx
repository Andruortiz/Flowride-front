import type { ReactNode } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'
import { useTiempoReal } from '../api/tiempoReal.ts'

const icono = (trazo: ReactNode) => <svg viewBox="0 0 24 24" aria-hidden="true">{trazo}</svg>

const secciones = [
    {
        titulo: 'Operación',
        items: [
            { ruta: '/', texto: 'Inicio', icono: icono(<path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" />) },
            { ruta: '/solicitudes', texto: 'Solicitudes', icono: icono(<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7" />) },
            { ruta: '/asignaciones', texto: 'Asignaciones', icono: icono(<path d="M16 11a4 4 0 100-8 4 4 0 000 8zM4 21v-1a6 6 0 0112 0v1M17 14l2 2 3-4" />) },
            { ruta: '/viajes', texto: 'Viajes', icono: icono(<path d="M5 17h14M6 17l1.5-6h9L18 17M7 17v2M17 17v2M9 11l1-3h4l1 3" />) },
        ],
    },
    {
        titulo: 'Supervisión',
        items: [
            { ruta: '/alertas', texto: 'Alertas', icono: icono(<path d="M12 4l9 16H3zM12 10v4M12 17v.5" />) },
            { ruta: '/reportes', texto: 'Reportes', icono: icono(<path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />) },
        ],
    },
]

const titulos = Object.fromEntries(secciones.flatMap(s => s.items.map(i => [i.ruta, i.texto])))

export default function Layout() {
    const auth = useAuth()
    const { pathname } = useLocation()
    useTiempoReal()
    const nombre = auth.user?.profile.preferred_username ?? ''

    return (
        <div className="app">
            <nav className="menu">
                <div className="menu-marca"><span className="logo-marca">F</span>FlowRide</div>
                {secciones.map(s => (
                    <div key={s.titulo}>
                        <div className="menu-seccion">{s.titulo}</div>
                        {s.items.map(i => (
                            <NavLink key={i.ruta} to={i.ruta} end={i.ruta === '/'}>{i.icono}{i.texto}</NavLink>
                        ))}
                    </div>
                ))}
            </nav>
            <div className="contenido">
                <header className="barra">
                    <h1>{titulos[pathname] ?? 'FlowRide'}</h1>
                    <div className="usuario">
                        <span>{nombre}</span>
                        <div className="avatar">{nombre.slice(0, 2)}</div>
                        <button onClick={() => auth.signoutRedirect()}>Salir</button>
                    </div>
                </header>
                <div className="pagina"><Outlet /></div>
            </div>
        </div>
    )
}
