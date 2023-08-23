import React from 'react';
import {Routes, Route} from 'react-router-dom';

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
      paddingLeft: 0,
      paddingRight: 0,
    },
  }),
);

const PageContainer = () => {

    const classes = useStyles();

    return (
        <Navigation>
            <div className={classes.root}>
                <Routes>
                    <Route path="/" element={<HomePage/>} />
                    <Route path="/silo/:deploymentID/:tokenSymbol/rates" element={<SiloRatesPage />} />
                    <Route path="/silo/:deploymentID/:tokenSymbol/tvl" element={<SiloTvlPage />} />
                    {/* <Route path="/silo/tvl" element={<SiloTvlPage />} /> */}
                </Routes>
            </div>
        </Navigation>
    )
}

export default PageContainer;