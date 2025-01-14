import { connect, ConnectedProps } from 'react-redux';

import {
  ISilo,
} from '../interfaces';

import RewardLogTable from '../components/RewardLogTable';

interface RootState {
  siloOverviews: ISilo[]
  isConsideredMobile: boolean
  selectedNetworkIDs: string[]
  selectedProtocolVersions: string[]
}
  
const mapStateToProps = (state: RootState) => ({
  siloOverviews: state.siloOverviews,
  isConsideredMobile: state.isConsideredMobile,
  selectedNetworkIDs: state.selectedNetworkIDs,
  selectedProtocolVersions: state.selectedProtocolVersions,
})

const connector = connect(mapStateToProps, {})
  
export type PropsFromRedux = ConnectedProps<typeof connector>

export default connector(RewardLogTable)