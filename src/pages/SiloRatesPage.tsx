import React from 'react';
import { useParams } from 'react-router-dom';

import Container from '@mui/material/Container';

import SiloSearchContainer from '../containers/SiloSearchContainer';

import SiloStatsContainer from '../containers/SiloStatsContainer';

import RateChartSelectionContainer from '../containers/RateChartSelectionContainer';

import ReturnHomeLink from '../components/ReturnHomeLink';

const SiloRatesPage = () => {

    let { tokenSymbol, deploymentID } = useParams();

    return (
        <Container maxWidth="xl">
            <div style={{marginTop: 12}}/>
            <ReturnHomeLink/>
            <div style={{marginTop: 12}}/>
            <SiloSearchContainer />
            <div style={{marginTop: 24}}/>
            {(tokenSymbol && deploymentID) && 
                <RateChartSelectionContainer
                    tokenSymbol={tokenSymbol}
                    deploymentID={deploymentID}
                />
            }
            <div style={{marginTop: 24}}/>
            <SiloStatsContainer tokenSymbol={tokenSymbol} deploymentID={deploymentID} />
            <div style={{marginBottom: 50}}/>
        </Container>
    )
};

export default SiloRatesPage;