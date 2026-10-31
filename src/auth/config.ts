import type { AuthProviderProps } from 'react-oidc-context'

export const oidcConfig: AuthProviderProps = {
    authority: 'http://localhost:8080/realms/flowride',
    client_id: 'flowride-panel',
    redirect_uri: 'http://localhost:5173',
    scope: 'openid profile',
    onSigninCallback: () => {
        window.history.replaceState({}, document.title, window.location.pathname)
    },
}