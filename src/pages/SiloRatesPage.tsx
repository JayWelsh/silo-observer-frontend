import React from 'react';
import { useParams } from 'react-router-dom';

import Container from '@mui/material/Container';

import SiloSearch from '../components/SiloSearch';

import RateChartSelectionContainer from '../containers/RateChartSelectionContainer';

const SiloRatesPage = () => {

    let { tokenSymbol } = useParams();

    return (
        <Container maxWidth="lg">
            <div style={{marginTop: 20}}/>
            <SiloSearch />
            <div style={{marginTop: 24}}/>
            {tokenSymbol && 
                <RateChartSelectionContainer
                    tokenSymbol={tokenSymbol}
                />
            }
        </Container>
    )
};

export default SiloRatesPage;