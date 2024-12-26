import React from 'react';

import Container from '@mui/material/Container';

import SiloSearchContainer from '../containers/SiloSearchContainer';
import RevenueCompositionContainer from '../containers/RevenueCompositionContainer';
import ReturnHomeLink from '../components/ReturnHomeLink';

import { PropsFromRedux } from '../containers/HomePageContainer';

const RevenuePage = (props: PropsFromRedux) => {
  return (
    <Container maxWidth="lg">
      <div style={{marginTop: 12}}/>
      <ReturnHomeLink/>
      <div style={{marginTop: 12}}/>
      <SiloSearchContainer />
      <div style={{marginTop: 24}}/>
      <RevenueCompositionContainer />
      <div style={{marginTop: 48}}/>
    </Container>
  )
};

export default RevenuePage;