import { connect, ConnectedProps } from 'react-redux';

import { setSiloOverviews } from '../state/actions';

import {
  ISilo,
} from '../interfaces';

import SiloSearch from '../components/SiloSearch';

interface RootState {
  siloOverviews: ISilo[]
}
  
const mapStateToProps = (state: RootState) => ({
  siloOverviews: state.siloOverviews
})

const mapDispatchToProps = {
  setSiloOverviews
}

const connector = connect(mapStateToProps, mapDispatchToProps)
  
export type PropsFromRedux = ConnectedProps<typeof connector>

export default connector(SiloSearch)