import { useQuery } from '@tanstack/react-query'
import { api } from '../../api/cliente.ts'

type Indicadores = {
    solicitudes: number; finalizadas: number; canceladas: number; sinConductor: number
    porcentajeAsignacionAutomatica: number; porcentajePuntualidad: number; calificacionPromedio: number
}
type Alerta = { id: string; titulo: string; detalle: string; severidad: string }

const hasta = new Date()
const desde = new Date(hasta.getTime() - 30 * 24 * 3600 * 1000)

export default function Dashboard() {
    const ind = useQuery({
        queryKey: ['indicadores'],
        queryFn: () => api<Indicadores>(`/reportes/indicadores?desde=${desde.toISOString()}&hasta=${hasta.toISOString()}`),
    })
    const alertas = useQuery({
        queryKey: ['alertas'],
        queryFn: () => api<Alerta[]>('/alertas'),
        refetchInterval: 60_000,
    })

    if (ind.error) return <p className="error">{ind.error.message}</p>

    const tarjetas = [
        ['Solicitudes', ind.data?.solicitudes],
        ['Finalizadas', ind.data?.finalizadas],
        ['Canceladas', ind.data?.canceladas],
        ['Sin conductor', ind.data?.sinConductor],
    ]

    return (
        <>
            <div className="encabezado">
                <h2>Resumen operativo</h2>
                <p>Indicadores de los últimos 30 días</p>
            </div>
            <div className="indicadores">
                {tarjetas.map(([texto, valor]) => (
                    <div className="indicador" key={texto}>
                        <span>{texto}</span>
                        <strong>{valor ?? '–'}</strong>
                    </div>
                ))}
            </div>
            <div className="panel">
                <div className="panel-cabecera"><h3>Alertas sin leer</h3></div>
                {alertas.data?.length === 0 && <p className="vacio">No hay alertas pendientes.</p>}
                {alertas.data?.map(a => (
                    <div className="alerta" key={a.id}>
                        <b>{a.titulo}</b>
                        <small>{a.detalle}</small>
                    </div>
                ))}
            </div>
        </>
    )
}
