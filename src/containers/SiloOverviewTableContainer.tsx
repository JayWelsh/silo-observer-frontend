import { connect, ConnectedProps } from 'react-redux';

import {
  ISilo,
} from '../interfaces';

import SiloOverviewTable from '../components/SiloOverviewTable';

interface RootState {
  siloOverviews: ISilo[]
  selectedNetworkIDs: string[]
  selectedProtocolVersions: string[]
}
  
const mapStateToProps = (state: RootState) => ({
  siloOverviews: state.siloOverviews,
  selectedNetworkIDs: state.selectedNetworkIDs,
  selectedProtocolVersions: state.selectedProtocolVersions,
})

const connector = connect(mapStateToProps, {})
  
export type PropsFromRedux = ConnectedProps<typeof connector>

export default connector(SiloOverviewTable)