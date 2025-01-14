import {
    ISilo
} from '../../interfaces'

export const setShowLeftMenu = (visible: boolean) => ({
    type: "SHOW_LEFT_MENU",
    visible
})

export const setActiveAccount = (account: string) => ({
    type: "SET_ACTIVE_ACCOUNT",
    account
})

export const setDarkMode = (active: boolean) => ({
    type: "SET_DARK_MODE",
    active
})

export const setConsideredMobile = (mobile: boolean) => ({
    type: "IS_CONSIDERED_MOBILE",
    mobile
})

export const setSiloOverviews = (siloOverviews: ISilo[]) => ({
    type: "SET_SILO_OVERVIEWS",
    siloOverviews
})

export const setSelectedNetworkIDs = (selectedNetworkIDs: string[]) => ({
    type: "SET_SELECTED_NETWORK_IDS",
    selectedNetworkIDs
})

export const setKnownNetworkIDs = (knownNetworkIDs: string[]) => ({
    type: "SET_KNOWN_NETWORK_IDS",
    knownNetworkIDs
})

export const setSelectedProtocolVersions = (selectedProtocolVersions: string[]) => ({
    type: "SET_SELECTED_PROTOCOL_VERSIONS",
    selectedProtocolVersions
})

export const setKnownProtocolVersions = (knownProtocolVersions: string[]) => ({
    type: "SET_KNOWN_PROTOCOL_VERSIONS",
    knownProtocolVersions
})