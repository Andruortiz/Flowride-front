import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../api/cliente.ts'
import { useNombres } from '../../api/nombres.ts'

type Asignacion = {
    id: string; solicitudId: string; conductorId: string; vehiculoId: string
    estado: string; esManual: boolean; motivo: string | null
}

const estados = ['PendienteAceptacion', 'Aceptada', 'EnCurso', 'Finalizada', 'Rechazada', 'Reasignada', 'Cancelada']

export default function Asignaciones() {
    const [estado, setEstado] = useState('')
    const nombres = useNombres()
    const lista = useQuery({
        queryKey: ['asignaciones', estado],
        queryFn: () => api<Asignacion[]>(`/asignaciones?tamano=100${estado ? `&estado=${estado}` : ''}`),
        refetchInterval: 10_000,
    })

    return (
        <>
            <div className="encabezado">
                <h2>Asignaciones</h2>
                <p>Conductores y vehículos asignados a cada servicio</p>
            </div>
            {lista.error && <p className="error">{lista.error.message}</p>}
            <div className="panel">
                <div className="panel-cabecera">
                    <h3>{lista.data ? `${lista.data.length} asignaciones` : 'Asignaciones'}</h3>
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
                        <tr><th>Conductor</th><th>Vehículo</th><th>Estado</th><th>Origen</th><th>Motivo</th></tr>
                    </thead>
                    <tbody>
                        {lista.data?.map(a => (
                            <tr key={a.id}>
                                <td>{nombres.conductor(a.conductorId)}</td>
                                <td>{nombres.vehiculo(a.vehiculoId)}</td>
                                <td><span className={`etiqueta ${a.estado}`}>{a.estado}</span></td>
                                <td>{a.esManual ? 'Manual' : 'Automática'}</td>
                                <td>{a.motivo}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {lista.data?.length === 0 && <p className="vacio">No hay asignaciones.</p>}
            </div>
        </>
    )
}
