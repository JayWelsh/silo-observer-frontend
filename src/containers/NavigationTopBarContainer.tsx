import { connect, ConnectedProps } from 'react-redux';

import { setShowLeftMenu, setDarkMode } from '../state/actions';

import NavigationTopBar from '../components/NavigationTopBar';

interface RootState {
    showLeftMenu: boolean;
    darkMode: boolean;
    isConsideredMobile: boolean;
}
  
const mapStateToProps = (state: RootState) => ({
    showLeftMenu: state.showLeftMenu,
    darkMode: state.darkMode,
    isConsideredMobile: state.isConsideredMobile,
})
  
const mapDispatchToProps = {
    setShowLeftMenu,
    setDarkMode,
}
  
const connector = connect(mapStateToProps, mapDispatchToProps)
  
export type PropsFromRedux = ConnectedProps<typeof connector>

export default connector(NavigationTopBar)