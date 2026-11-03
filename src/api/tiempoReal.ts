import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import { token } from './cliente.ts'

const consultasPorTema: Record<string, string[]> = {
    solicitudes: ['solicitudes', 'indicadores'],
    asignaciones: ['asignaciones'],
    viajes: ['viajes'],
    alertas: ['alertas'],
    ubicaciones: ['ubicaciones'],
}

const esperaMs = 400

export function useTiempoReal() {
    const cliente = useQueryClient()

    useEffect(() => {
        const pendientes = new Set<string>()
        let temporizador: ReturnType<typeof setTimeout> | undefined

        const conexion = new HubConnectionBuilder()
            .withUrl('/api/v1/tiempo-real', { accessTokenFactory: () => token() ?? '' })
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Warning)
            .build()

        conexion.on('cambio', (tema: string) => {
            pendientes.add(tema)
            clearTimeout(temporizador)
            temporizador = setTimeout(() => {
                pendientes.forEach(t => (consultasPorTema[t] ?? []).forEach(k => cliente.invalidateQueries({ queryKey: [k] })))
                pendientes.clear()
            }, esperaMs)
        })
        conexion.onreconnected(() => cliente.invalidateQueries())
        conexion.start().catch(() => undefined)

        return () => {
            clearTimeout(temporizador)
            void conexion.stop()
        }
    }, [cliente])
}
