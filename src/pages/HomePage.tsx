import React from 'react';

import Container from '@mui/material/Container';

import SiloSearchContainer from '../containers/SiloSearchContainer';
import TvlChartSelectionContainer from '../containers/TvlChartSelectionContainer';
import SiloOverviewTableContainer from '../containers/SiloOverviewTableContainer';

const HomePage = () => {
    return (
        <Container maxWidth="lg">
            <div style={{marginTop: 24}}/>
            <SiloSearchContainer />
            <div style={{marginTop: 24}}/>
            <TvlChartSelectionContainer />
            <div style={{marginTop: 24}}/>
            <SiloOverviewTableContainer/>
            <div style={{marginBottom: 50}}/>
        </Container>
    )
};

export default HomePage;