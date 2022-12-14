import { connect, ConnectedProps } from 'react-redux';

import {
  ISilo,
} from '../interfaces';

import SiloOverviewTable from '../components/SiloOverviewTable';

interface RootState {
  siloOverviews: ISilo[]
}
  
const mapStateToProps = (state: RootState) => ({
  siloOverviews: state.siloOverviews
})

const connector = connect(mapStateToProps, {})
  
export type PropsFromRedux = ConnectedProps<typeof connector>

export default connector(SiloOverviewTable)