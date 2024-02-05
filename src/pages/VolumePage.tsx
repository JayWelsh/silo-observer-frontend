import React from 'react';
import { useParams } from 'react-router-dom';
import Container from '@mui/material/Container';

import VolumeChartSelectionContainer from '../containers/VolumeChartSelectionContainer';

import ReturnHomeLink from '../components/ReturnHomeLink';
import EventLogTableContainer from '../containers/EventLogTableContainer';
import LiquidationLogTableContainer from '../containers/LiquidationLogTableContainer';

const SiloTvlPage = () => {

  let { volumeType } = useParams();

  return (
      <Container maxWidth="xl">
          <div style={{marginTop: 12}}/>
          <ReturnHomeLink/>
          <div style={{marginTop: 12}}/>
          {volumeType && 
            <VolumeChartSelectionContainer
              volumeType={volumeType}
            />
          }
          <div style={{marginTop: 24}}/>
          {volumeType === 'liquidation' &&
            <LiquidationLogTableContainer
              eventType={volumeType}
            />
          }
          {volumeType && (['liquidation'].indexOf(volumeType) === -1) && 
            <EventLogTableContainer
              eventType={volumeType}
            />
          }
          <div style={{marginBottom: 50}}/>
      </Container>
  )
};

export default SiloTvlPage;