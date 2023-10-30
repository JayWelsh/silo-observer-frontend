import { connect, ConnectedProps } from 'react-redux';

import PieChart from '../components/PieChart';

interface RootState {
  isConsideredMobile: boolean;
}
  
const mapStateToProps = (state: RootState) => ({
  isConsideredMobile: state.isConsideredMobile
})

const connector = connect(mapStateToProps, {})
  
export type PropsFromRedux = ConnectedProps<typeof connector>

export default connector(PieChart)