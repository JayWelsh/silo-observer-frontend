import { connect, ConnectedProps } from 'react-redux';

import {
  ISilo,
} from '../interfaces';

import HomePage from '../pages/HomePage';

interface RootState {
  siloOverviews: ISilo[]
  isConsideredMobile: boolean
  selectedNetworkIDs: string[]
}
  
const mapStateToProps = (state: RootState) => ({
  siloOverviews: state.siloOverviews,
  isConsideredMobile: state.isConsideredMobile,
  selectedNetworkIDs: state.selectedNetworkIDs
})

const connector = connect(mapStateToProps, {})
  
export type PropsFromRedux = ConnectedProps<typeof connector>

export default connector(HomePage)