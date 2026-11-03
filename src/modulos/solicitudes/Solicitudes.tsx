import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/cliente.ts'
import { useNombres } from '../../api/nombres.ts'

type Solicitud = {
    id: string; pasajeroId: string; origen: string | null; destino: string | null
    fechaHoraProgramada: string; urgente: boolean; estado: string
    asignacionId: string | null; intentos: number; motivoCancelacion: string | null
}

const estados = ['Pendiente', 'EnRevision', 'Asignada', 'EnCurso', 'Finalizada', 'Cancelada']

const formato = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Bogota' })

export default function Solicitudes() {
    const [estado, setEstado] = useState('')
    const nombres = useNombres()
    const cliente = useQueryClient()
    const lista = useQuery({
        queryKey: ['solicitudes', estado],
        queryFn: () => api<Solicitud[]>(`/solicitudes?tamano=100${estado ? `&estado=${estado}` : ''}`),
        refetchInterval: 60_000,
    })
    const refrescar = () => cliente.invalidateQueries({ queryKey: ['solicitudes'] })
    const asignar = useMutation({ mutationFn: (id: string) => api(`/solicitudes/${id}/asignar`, {}), onSuccess: refrescar })
    const cancelar = useMutation({
        mutationFn: (p: { id: string; motivo: string }) => api(`/solicitudes/${p.id}/cancelar`, { motivo: p.motivo }),
        onSuccess: refrescar,
    })

    const error = lista.error ?? asignar.error ?? cancelar.error

    return (
        <>
            <div className="encabezado">
                <h2>Solicitudes de servicio</h2>
                <p>Gestiona, asigna y cancela los servicios programados</p>
            </div>
            {error && <p className="error">{error.message}</p>}
            <div className="panel">
                <div className="panel-cabecera">
                    <h3>{lista.data ? `${lista.data.length} solicitudes` : 'Solicitudes'}</h3>
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
                    <tr>
                        <th>Recogida (Bogotá)</th><th>Pasajero</th><th>Origen</th><th>Destino</th><th>Estado</th><th>Intentos</th><th></th>
                    </tr>
                </thead>
                <tbody>
                    {lista.data?.map(s => (
                        <tr key={s.id}>
                            <td>
                                {formato.format(new Date(s.fechaHoraProgramada))}
                                {s.urgente && <span className="urgente">urgente</span>}
                            </td>
                            <td>{nombres.pasajero(s.pasajeroId)}</td>
                            <td>{s.origen}</td>
                            <td>{s.destino}</td>
                            <td>
                                <span className={`etiqueta ${s.estado}`}>{s.estado}</span>
                                {s.motivoCancelacion && <small> {s.motivoCancelacion}</small>}
                            </td>
                            <td>{s.intentos}</td>
                            <td>
                                <div className="acciones">
                                    {(s.estado === 'Pendiente' || s.estado === 'EnRevision') && (
                                        <button className="primario" disabled={asignar.isPending} onClick={() => asignar.mutate(s.id)}>Asignar</button>
                                    )}
                                    {['Pendiente', 'EnRevision', 'Asignada'].includes(s.estado) && (
                                        <button
                                            className="peligro"
                                            disabled={cancelar.isPending}
                                            onClick={() => {
                                                const motivo = window.prompt('Motivo de la cancelación')
                                                if (motivo?.trim()) cancelar.mutate({ id: s.id, motivo: motivo.trim() })
                                            }}
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
                </table>
                {lista.data?.length === 0 && <p className="vacio">No hay solicitudes.</p>}
            </div>
        </>
    )
}
