import { connect, ConnectedProps } from 'react-redux';

import { 
  setSelectedNetworkIDs,
  setKnownNetworkIDs,
} from '../state/actions';

import NetworkSelectionList from '../components/NetworkSelectionList';

interface RootState {
  darkMode: boolean
  isConsideredMobile: boolean
  selectedNetworkIDs: string[]
  knownNetworkIDs: string[]
}
  
const mapStateToProps = (state: RootState) => ({
  darkMode: state.darkMode,
  isConsideredMobile: state.isConsideredMobile,
  selectedNetworkIDs: state.selectedNetworkIDs,
  knownNetworkIDs: state.knownNetworkIDs,
})

const mapDispatchToProps = {
  setSelectedNetworkIDs,
  setKnownNetworkIDs,
}

const connector = connect(mapStateToProps, mapDispatchToProps);
  
export type PropsFromRedux = ConnectedProps<typeof connector>

export default connector(NetworkSelectionList)