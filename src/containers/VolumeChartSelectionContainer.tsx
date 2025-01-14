import { connect, ConnectedProps } from 'react-redux';

import VolumeChartSelection from '../components/VolumeChartSelection';

interface RootState {
  darkMode: boolean
  isConsideredMobile: boolean
  selectedNetworkIDs: string[]
  selectedProtocolVersions: string[]
}
  
const mapStateToProps = (state: RootState) => ({
  darkMode: state.darkMode,
  isConsideredMobile: state.isConsideredMobile,
  selectedNetworkIDs: state.selectedNetworkIDs,
  selectedProtocolVersions: state.selectedProtocolVersions,
})

const connector = connect(mapStateToProps, {})
  
export type PropsFromRedux = ConnectedProps<typeof connector>

export default connector(VolumeChartSelection)