import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/cliente.ts'

type Alerta = {
    id: string; tipo: string; severidad: string; titulo: string; detalle: string
    creadaEn: string; leidaEn: string | null
}

const formato = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Bogota' })

export default function Alertas() {
    const [soloNoLeidas, setSoloNoLeidas] = useState(true)
    const cliente = useQueryClient()
    const lista = useQuery({
        queryKey: ['alertas', soloNoLeidas],
        queryFn: () => api<Alerta[]>(`/alertas?soloNoLeidas=${soloNoLeidas}&tamano=100`),
        refetchInterval: 60_000,
    })
    const leer = useMutation({
        mutationFn: (id: string) => api(`/alertas/${id}/leida`, {}),
        onSuccess: () => cliente.invalidateQueries({ queryKey: ['alertas'] }),
    })

    const error = lista.error ?? leer.error

    return (
        <>
            <div className="encabezado">
                <h2>Alertas</h2>
                <p>Situaciones que requieren atención del operador</p>
            </div>
            {error && <p className="error">{error.message}</p>}
            <div className="panel">
                <div className="panel-cabecera">
                    <h3>{lista.data ? `${lista.data.length} alertas` : 'Alertas'}</h3>
                    <label>
                        <input type="checkbox" checked={soloNoLeidas} onChange={e => setSoloNoLeidas(e.target.checked)} /> Solo sin leer
                    </label>
                </div>
                <table className="tabla">
                    <thead>
                        <tr><th>Fecha (Bogotá)</th><th>Severidad</th><th>Alerta</th><th></th></tr>
                    </thead>
                    <tbody>
                        {lista.data?.map(a => (
                            <tr key={a.id}>
                                <td>{formato.format(new Date(a.creadaEn))}</td>
                                <td><span className={`etiqueta ${a.severidad}`}>{a.severidad}</span></td>
                                <td>
                                    <b>{a.titulo}</b>
                                    <br />
                                    <small>{a.detalle}</small>
                                </td>
                                <td>
                                    {!a.leidaEn && (
                                        <button disabled={leer.isPending} onClick={() => leer.mutate(a.id)}>Marcar leída</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {lista.data?.length === 0 && <p className="vacio">No hay alertas.</p>}
            </div>
        </>
    )
}
