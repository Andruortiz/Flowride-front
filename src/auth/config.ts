import type { AuthProviderProps } from 'react-oidc-context'

export const authority = import.meta.env.VITE_KEYCLOAK_URL ?? 'http://localhost:8080/realms/flowride'
export const clientId = 'flowride-panel'

export const oidcConfig: AuthProviderProps = {
    authority,
    client_id: clientId,
    redirect_uri: window.location.origin,
    scope: 'openid profile',
    onSigninCallback: () => {
        window.history.replaceState({}, document.title, window.location.pathname)
    },
}
