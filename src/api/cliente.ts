import { User } from 'oidc-client-ts'

const clave = 'oidc.user:http://localhost:8080/realms/flowride:flowride-panel'

function token() {
    const raw = sessionStorage.getItem(clave)
    return raw ? User.fromStorageString(raw).access_token : undefined
}

export async function api<T>(ruta: string, cuerpo?: unknown): Promise<T> {
    const r = await fetch(`/api/v1${ruta}`, {
        method: cuerpo === undefined ? 'GET' : 'POST',
        headers: {
            Authorization: `Bearer ${token()}`,
            ...(cuerpo === undefined ? {} : { 'Content-Type': 'application/json' }),
        },
        body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    })
    if (!r.ok) {
        const p = await r.json().catch(() => ({}))
        throw new Error(p.detail ?? `Error ${r.status}`)
    }
    return r.status === 204 ? (undefined as T) : r.json()
}
