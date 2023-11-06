import { connect, ConnectedProps } from 'react-redux';

import UserMetricsChartSelection from '../components/UserMetricsChartSelection';

interface RootState {
  darkMode: boolean
  isConsideredMobile: boolean
  selectedNetworkIDs: string[]
}
  
const mapStateToProps = (state: RootState) => ({
  darkMode: state.darkMode,
  isConsideredMobile: state.isConsideredMobile,
  selectedNetworkIDs: state.selectedNetworkIDs,
})

const connector = connect(mapStateToProps, {})
  
export type PropsFromRedux = ConnectedProps<typeof connector>

export default connector(UserMetricsChartSelection)