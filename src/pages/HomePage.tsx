import React from 'react';

import Container from '@mui/material/Container';

import TvlChartSelection from '../components/TvlChartSelection';

const HomePage = () => {
    return (
        <Container maxWidth="lg">
            <div style={{marginTop: 50, maxWidth: 180}}/>
            <TvlChartSelection />
        </Container>
    )
};

export default HomePage;