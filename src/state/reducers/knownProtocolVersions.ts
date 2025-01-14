interface IKnownProtocolVersionReducer {
  type: string;
  knownProtocolVersions: string[];
}

const knownProtocolVersions = (state = ["1","2"], action: IKnownProtocolVersionReducer) => {
  // default state is [1,2] because this feature was added when those were the only protocol versions that should be known at the time
  switch (action.type) {
    case 'SET_KNOWN_PROTOCOL_VERSIONS':
      return action.knownProtocolVersions
    default:
      return state
  }
}

export default knownProtocolVersions;