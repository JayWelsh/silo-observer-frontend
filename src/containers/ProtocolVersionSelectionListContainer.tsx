import { connect, ConnectedProps } from 'react-redux';

import {
  setKnownProtocolVersions,
  setSelectedProtocolVersions,
} from '../state/actions';

import ProtocolVersionSelectionList from '../components/ProtocolVersionSelectionList';

interface RootState {
  darkMode: boolean
  isConsideredMobile: boolean
  selectedProtocolVersions: string[]
  knownProtocolVersions: string[]
}
  
const mapStateToProps = (state: RootState) => ({
  darkMode: state.darkMode,
  isConsideredMobile: state.isConsideredMobile,
  selectedProtocolVersions: state.selectedProtocolVersions,
  knownProtocolVersions: state.knownProtocolVersions,
})

const mapDispatchToProps = {
  setSelectedProtocolVersions,
  setKnownProtocolVersions,
}

const connector = connect(mapStateToProps, mapDispatchToProps);
  
export type PropsFromRedux = ConnectedProps<typeof connector>

export default connector(ProtocolVersionSelectionList)