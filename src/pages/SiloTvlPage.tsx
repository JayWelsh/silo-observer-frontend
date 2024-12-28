import React from 'react';
import { useParams } from 'react-router-dom';
import Container from '@mui/material/Container';
import BigNumber from 'bignumber.js';

import SiloSearchContainer from '../containers/SiloSearchContainer';
import TvlChartSelectionContainer from '../containers/TvlChartSelectionContainer';

import SiloStatsContainer from '../containers/SiloStatsContainer';

import ReturnHomeLink from '../components/ReturnHomeLink';

BigNumber.config({ EXPONENTIAL_AT: 1e+9 });

const SiloTvlPage = () => {

  let { tokenSymbol, deploymentID } = useParams();

  return (
      <Container maxWidth="xl">
          <div style={{marginTop: 12}}/>
          <ReturnHomeLink/>
          <div style={{marginTop: 12}}/>
          <SiloSearchContainer />
          <div style={{marginTop: 24}}/>
          <TvlChartSelectionContainer
            tokenSymbol={tokenSymbol}
            deploymentID={deploymentID}
          />
          <div style={{marginTop: 24}}/>
          <SiloStatsContainer tokenSymbol={tokenSymbol} deploymentID={deploymentID} />
          <div style={{marginBottom: 50}}/>
      </Container>
  )
};

export default SiloTvlPage;