import React from 'react';
import { useParams } from 'react-router-dom';

import Container from '@mui/material/Container';

import SiloSearchContainer from '../containers/SiloSearchContainer';

import RateChartSelectionContainer from '../containers/RateChartSelectionContainer';

const SiloRatesPage = () => {

    let { tokenSymbol } = useParams();

    return (
        <Container maxWidth="lg">
            <div style={{marginTop: 24}}/>
            <SiloSearchContainer />
            <div style={{marginTop: 24}}/>
            {tokenSymbol && 
                <RateChartSelectionContainer
                    tokenSymbol={tokenSymbol}
                />
            }
            <div style={{marginBottom: 50}}/>
        </Container>
    )
};

export default SiloRatesPage;