interface ISelectedProtocolVersionsReducer {
  type: string;
  selectedProtocolVersions: string[];
}

const selectedProtocolVersions = (state = ["1", "2"], action: ISelectedProtocolVersionsReducer) => {
  switch (action.type) {
    case 'SET_SELECTED_PROTOCOL_VERSIONS':
      return action.selectedProtocolVersions
    default:
      return state
  }
}

export default selectedProtocolVersions;