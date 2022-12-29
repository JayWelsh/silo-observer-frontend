import React, { useState } from 'react';

import Container from '@mui/material/Container';
import { SelectChangeEvent } from '@mui/material/Select';

import SiloSearchContainer from '../containers/SiloSearchContainer';
import TvlChartSelectionContainer from '../containers/TvlChartSelectionContainer';
import UserMetricsChartSelectionContainer from '../containers/UserMetricsChartSelectionContainer';
import SiloOverviewTableContainer from '../containers/SiloOverviewTableContainer';

const HomePage = () => {

    const [selectedChartZone, setSelectedChartZone] = useState('tvl+borrowed');

    return (
        <Container maxWidth="lg">
            <div style={{marginTop: 24}}/>
            <SiloSearchContainer />
            <div style={{marginTop: 24}}/>
            {selectedChartZone === 'tvl+borrowed' &&
                <TvlChartSelectionContainer 
                    overrideHandleSiloZoneChange={(event: SelectChangeEvent<string>) => {
                        let value = event.target.value as string;
                        setSelectedChartZone(value)
                    }}
                />
            }
            {selectedChartZone === 'user-metrics' &&
                <UserMetricsChartSelectionContainer 
                    overrideHandleSiloZoneChange={(event: SelectChangeEvent<string>) => {
                        let value = event.target.value as string;
                        setSelectedChartZone(value)
                    }}
                />
            }
            <div style={{marginTop: 24}}/>
            <SiloOverviewTableContainer/>
            <div style={{marginBottom: 50}}/>
        </Container>
    )
};

export default HomePage;