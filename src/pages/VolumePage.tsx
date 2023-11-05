import React from 'react';
import { useParams } from 'react-router-dom';
import Container from '@mui/material/Container';

import VolumeChartSelectionContainer from '../containers/VolumeChartSelectionContainer';

import ReturnHomeLink from '../components/ReturnHomeLink';

const SiloTvlPage = () => {

  let { volumeType } = useParams();

  return (
      <Container maxWidth="lg">
          <div style={{marginTop: 12}}/>
          <ReturnHomeLink/>
          <div style={{marginTop: 12}}/>
          {volumeType && 
            <VolumeChartSelectionContainer
              volumeType={volumeType}
            />
          }
          <div style={{marginBottom: 50}}/>
      </Container>
  )
};

export default SiloTvlPage;