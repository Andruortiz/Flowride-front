import { Fragment, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../api/cliente.ts'
import { useNombres } from '../../api/nombres.ts'

type Hito = { instante: string; tipo: string; detalle: string }
type Viaje = {
    id: string; pasajeroId: string; conductorId: string; vehiculoId: string; estado: string
    programadoPara: string; etaProgramada: string; iniciadoEn: string | null; finalizadoEn: string | null
    alertaEtaActiva: boolean; hitos: Hito[]
}
type Ubicacion = { vehiculoId: string; latitud: number; longitud: number; timestampOrigen: string; fuente: string }

const estados = ['Programado', 'EnCurso', 'Finalizado', 'Cancelado']

const formato = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Bogota' })

function Mapa({ u }: { u: Ubicacion }) {
    const d = 0.01
    const caja = `${u.longitud - d},${u.latitud - d},${u.longitud + d},${u.latitud + d}`

    return (
        <iframe
            className="mapa"
            title="Última ubicación"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${caja}&layer=mapnik&marker=${u.latitud},${u.longitud}`}
        />
    )
}

export default function Viajes() {
    const [estado, setEstado] = useState('')
    const [abierto, setAbierto] = useState<string | null>(null)
    const nombres = useNombres()
    const lista = useQuery({
        queryKey: ['viajes', estado],
        queryFn: () => api<Viaje[]>(`/viajes?tamano=100${estado ? `&estado=${estado}` : ''}`),
        refetchInterval: 10_000,
    })
    const ubicaciones = useQuery({
        queryKey: ['ubicaciones'],
        queryFn: () => api<Ubicacion[]>('/ubicaciones/ultimas'),
        refetchInterval: 10_000,
    })

    return (
        <>
            <div className="encabezado">
                <h2>Viajes</h2>
                <p>Seguimiento de los servicios y su última ubicación conocida</p>
            </div>
            {lista.error && <p className="error">{lista.error.message}</p>}
            <div className="panel">
                <div className="panel-cabecera">
                    <h3>{lista.data ? `${lista.data.length} viajes` : 'Viajes'}</h3>
                    <label>
                        Estado{' '}
                        <select value={estado} onChange={e => setEstado(e.target.value)}>
                            <option value="">Todos</option>
                            {estados.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </label>
                </div>
                <table className="tabla">
                    <thead>
                        <tr><th>Programado (Bogotá)</th><th>Pasajero</th><th>Conductor</th><th>Vehículo</th><th>Estado</th><th></th></tr>
                    </thead>
                    <tbody>
                        {lista.data?.map(v => {
                            const ubicacion = ubicaciones.data?.find(u => u.vehiculoId === v.vehiculoId)

                            return (
                                <Fragment key={v.id}>
                                    <tr>
                                        <td>{formato.format(new Date(v.programadoPara))}</td>
                                        <td>{nombres.pasajero(v.pasajeroId)}</td>
                                        <td>{nombres.conductor(v.conductorId)}</td>
                                        <td>{nombres.vehiculo(v.vehiculoId)}</td>
                                        <td>
                                            <span className={`etiqueta ${v.estado}`}>{v.estado}</span>
                                            {v.alertaEtaActiva && <span className="urgente">retraso</span>}
                                        </td>
                                        <td>
                                            <button onClick={() => setAbierto(abierto === v.id ? null : v.id)}>
                                                {abierto === v.id ? 'Ocultar' : 'Detalle'}
                                            </button>
                                        </td>
                                    </tr>
                                    {abierto === v.id && (
                                        <tr>
                                            <td colSpan={6}>
                                                <div className="detalle">
                                                    <div>
                                                        <h4>Historial</h4>
                                                        {v.hitos.length === 0 && <p className="vacio">Sin hitos registrados.</p>}
                                                        <ul>
                                                            {v.hitos.map((h, i) => (
                                                                <li key={i}>
                                                                    {formato.format(new Date(h.instante))} · <b>{h.tipo}</b> {h.detalle}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <h4>Última ubicación</h4>
                                                        {ubicacion ? (
                                                            <>
                                                                <small>
                                                                    {formato.format(new Date(ubicacion.timestampOrigen))} · {ubicacion.fuente}
                                                                </small>
                                                                <Mapa u={ubicacion} />
                                                            </>
                                                        ) : (
                                                            <p className="vacio">Sin ubicaciones recientes.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            )
                        })}
                    </tbody>
                </table>
                {lista.data?.length === 0 && <p className="vacio">No hay viajes.</p>}
            </div>
        </>
    )
}
