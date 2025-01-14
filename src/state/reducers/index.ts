import {combineReducers} from 'redux';
import showLeftMenu from './showLeftMenu';
import activeAccount from './activeAccount';
import darkMode from './darkMode'
import isConsideredMobile from './isConsideredMobile';
import siloOverviews from './siloOverviews';
import selectedNetworkIDs from './selectedNetworkIDs';
import knownNetworkIDs from './knownNetworkIDs';
import knownProtocolVersions from './knownProtocolVersions';
import selectedProtocolVersions from './selectedProtocolVersions';

const rootReducer = combineReducers({
    showLeftMenu,
    activeAccount,
    darkMode,
    isConsideredMobile,
    siloOverviews,
    selectedNetworkIDs,
    knownNetworkIDs,
    knownProtocolVersions,
    selectedProtocolVersions,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;