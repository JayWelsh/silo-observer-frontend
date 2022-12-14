import React from 'react';

import Container from '@mui/material/Container';

import BigNumber from 'bignumber.js';

import TvlChartSelection from '../components/TvlChartSelection';

BigNumber.config({ EXPONENTIAL_AT: 1e+9 });

interface ISiloPageProps {
  tokenSymbol?: string;
}

const SiloTvlPage = (props: ISiloPageProps) => {

    const { tokenSymbol } = props;

    return (
        <Container maxWidth="lg">
            <div style={{marginTop: 50}}/>
            <TvlChartSelection
              tokenSymbol={tokenSymbol}
            />
        </Container>
    )
};

export default SiloTvlPage;