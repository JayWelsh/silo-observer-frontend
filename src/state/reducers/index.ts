import {combineReducers} from 'redux';
import showLeftMenu from './showLeftMenu';
import activeAccount from './activeAccount';
import darkMode from './darkMode'
import isConsideredMobile from './isConsideredMobile';

const rootReducer = combineReducers({
    showLeftMenu,
    activeAccount,
    darkMode,
    isConsideredMobile,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;