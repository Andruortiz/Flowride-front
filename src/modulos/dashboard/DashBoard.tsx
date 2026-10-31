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
        refetchInterval: 10_000,
    })

    if (ind.error) return <p>{ind.error.message}</p>

    return (
        <>
            <h2>Últimos 30 días</h2>
            <ul>
                <li>Solicitudes: {ind.data?.solicitudes}</li>
                <li>Finalizadas: {ind.data?.finalizadas}</li>
                <li>Canceladas: {ind.data?.canceladas}</li>
                <li>Sin conductor: {ind.data?.sinConductor}</li>
            </ul>
            <h2>Alertas sin leer</h2>
            {alertas.data?.map(a => <p key={a.id}><b>{a.titulo}</b>: {a.detalle}</p>)}
        </>
    )
}