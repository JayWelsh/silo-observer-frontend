import React from 'react';

import Container from '@mui/material/Container';

import RateChartSelection from '../components/RateChartSelection';

interface ISiloRatesPageProps {
    tokenSymbol: string;
}

const SiloPage = (props: ISiloRatesPageProps) => {

    const { tokenSymbol } = props;

    return (
        <Container maxWidth="lg">
            <div style={{marginTop: 50}}/>
            <RateChartSelection
                tokenSymbol={tokenSymbol}
            />
        </Container>
    )
};

export default SiloPage;