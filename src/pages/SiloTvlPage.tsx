import React from 'react';
import { useParams } from 'react-router-dom';
import Container from '@mui/material/Container';
import BigNumber from 'bignumber.js';

import SiloSearch from '../components/SiloSearch';

import TvlChartSelectionContainer from '../containers/TvlChartSelectionContainer';

BigNumber.config({ EXPONENTIAL_AT: 1e+9 });

const SiloTvlPage = () => {

  let { tokenSymbol } = useParams();

  return (
      <Container maxWidth="lg">
          <div style={{marginTop: 20}}/>
          <SiloSearch />
          <div style={{marginTop: 24}}/>
          <TvlChartSelectionContainer
            tokenSymbol={tokenSymbol}
          />
      </Container>
  )
};

export default SiloTvlPage;