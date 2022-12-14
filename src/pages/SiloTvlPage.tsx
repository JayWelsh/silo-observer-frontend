import React, {useEffect, useState} from 'react';

import makeStyles from '@mui/styles/makeStyles';
import Container from '@mui/material/Container';

import BigNumber from 'bignumber.js';

import TvlChartSelection from '../components/TvlChartSelection';

BigNumber.config({ EXPONENTIAL_AT: 1e+9 });

const useStyles = makeStyles({
    root: {
        minWidth: 275,
        marginBottom: 15
    },
    title: {
        fontSize: 14,
    },
});

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