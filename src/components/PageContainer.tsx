import React from 'react';
import {Route, withRouter, Switch, RouteComponentProps} from 'react-router-dom';

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Navigation from './Navigation';
import HomePage from '../pages/HomePage';
import SiloRatesPage from '../pages/SiloRatesPage';
import SiloTvlPage from '../pages/SiloTvlPage';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
    },
  }),
);

const PageContainer = () => {

    const classes = useStyles();

    return (
        <Navigation>
            <div className={classes.root}>
                <Switch>
                    <Route path="/" exact render={(props) => homeRoute(props)} />
                    <Route path="/silo/:tokenSymbol/rates" exact render={(props) => ratesRoute(props)} />
                    <Route path="/silo/:tokenSymbol/tvl" exact render={(props) => siloTvlRoute(props)} />
                    <Route path="/silo/tvl" exact render={(props) => siloTvlRoute(props)} />
                </Switch>
            </div>
        </Navigation>
    )
}

const homeRoute = (props: RouteComponentProps) => {
    return (
        <HomePage/>
    )
}

const ratesRoute = (props: RouteComponentProps<{ tokenSymbol: string }>) => {
    const {
        match: {
            params: { tokenSymbol }
        }
    } = props
    return (
        <SiloRatesPage tokenSymbol={tokenSymbol}/>
    )
}

const siloTvlRoute = (props: RouteComponentProps<{ tokenSymbol: string }>) => {
    const {
        match: {
            params: { tokenSymbol }
        }
    } = props
    return (
        <SiloTvlPage tokenSymbol={tokenSymbol}/>
    )
}

export default withRouter(PageContainer);