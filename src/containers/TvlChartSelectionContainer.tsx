import { connect, ConnectedProps } from 'react-redux';

import TvlChartSelection from '../components/TvlChartSelection';

interface RootState {
  darkMode: boolean
  isConsideredMobile: boolean
}
  
const mapStateToProps = (state: RootState) => ({
  darkMode: state.darkMode,
  isConsideredMobile: state.isConsideredMobile,
})

const connector = connect(mapStateToProps, {})
  
export type PropsFromRedux = ConnectedProps<typeof connector>

export default connector(TvlChartSelection)