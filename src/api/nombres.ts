import { useQuery } from '@tanstack/react-query'
import { api } from './cliente.ts'

type Pasajero = { id: string; nombre: string }
type Conductor = { id: string; nombre: string; vehiculoId: string | null }
type Vehiculo = { id: string; placa: string }

const porId = <T extends { id: string }>(lista: T[] | undefined) => new Map((lista ?? []).map(x => [x.id, x]))

export function useNombres() {
    const pasajeros = useQuery({ queryKey: ['pasajeros'], queryFn: () => api<Pasajero[]>('/pasajeros'), staleTime: 60_000 })
    const conductores = useQuery({ queryKey: ['conductores'], queryFn: () => api<Conductor[]>('/conductores'), staleTime: 60_000 })
    const vehiculos = useQuery({ queryKey: ['vehiculos'], queryFn: () => api<Vehiculo[]>('/vehiculos'), staleTime: 60_000 })

    const p = porId(pasajeros.data)
    const c = porId(conductores.data)
    const v = porId(vehiculos.data)

    return {
        pasajero: (id: string) => p.get(id)?.nombre ?? '–',
        conductor: (id: string) => c.get(id)?.nombre ?? '–',
        vehiculo: (id: string) => v.get(id)?.placa ?? '–',
    }
}
