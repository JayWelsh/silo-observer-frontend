import React from 'react';

import Container from '@mui/material/Container';

import SiloSearch from '../components/SiloSearch';

import TvlChartSelectionContainer from '../containers/TvlChartSelectionContainer';

const HomePage = () => {
    return (
        <Container maxWidth="lg">
            <div style={{marginTop: 20}}/>
            <SiloSearch />
            <div style={{marginTop: 24}}/>
            <TvlChartSelectionContainer />
        </Container>
    )
};

export default HomePage;