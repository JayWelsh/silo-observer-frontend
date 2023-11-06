interface ISelectedNetworkIDsReducer {
  type: string;
  selectedNetworkIDs: string[];
}

const selectedNetworkIDs = (state = ["ethereum", "arbitrum"], action: ISelectedNetworkIDsReducer) => {
  switch (action.type) {
    case 'SET_SELECTED_NETWORK_IDS':
      console.log({action})
      return action.selectedNetworkIDs
    default:
      return state
  }
}

export default selectedNetworkIDs;