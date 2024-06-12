interface IKnownNetworkIDsReducer {
  type: string;
  knownNetworkIDs: string[];
}

const knownNetworkIDs = (state = ["ethereum", "arbitrum"], action: IKnownNetworkIDsReducer) => {
  // default state is ["ethereum", "arbitrum"] because this feature was added when those were the only networks that should be known at the time
  switch (action.type) {
    case 'SET_KNOWN_NETWORK_IDS':
      return action.knownNetworkIDs
    default:
      return state
  }
}

export default knownNetworkIDs;