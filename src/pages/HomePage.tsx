import React, {useEffect, useState} from 'react';

import makeStyles from '@mui/styles/makeStyles';
import Container from '@mui/material/Container';

import TvlChartSelection from '../components/TvlChartSelection';

const useStyles = makeStyles({
    root: {
        minWidth: 275,
        marginBottom: 15
    },
    title: {
        fontSize: 14,
    },
});

const HomePage = () => {
    return (
        <Container maxWidth="lg">
            <div style={{marginTop: 50, maxWidth: 180}}/>
            <TvlChartSelection />
        </Container>
    )
};

export default HomePage;