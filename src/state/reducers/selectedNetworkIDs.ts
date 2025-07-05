interface ISelectedNetworkIDsReducer {
  type: string;
  selectedNetworkIDs: string[];
}

const selectedNetworkIDs = (state = ["ethereum", "arbitrum", "optimism", "base", "sonic", "avalanche"], action: ISelectedNetworkIDsReducer) => {
  switch (action.type) {
    case 'SET_SELECTED_NETWORK_IDS':
      return action.selectedNetworkIDs
    default:
      return state
  }
}

export default selectedNetworkIDs;