import React, { useEffect, useState } from 'react';

import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';

import { API_ENDPOINT } from '../constants';
import { ISilo, IRate } from '../interfaces';

import { priceFormat, addNumbers } from '../utils';

import SingleStatCard from './SingleStatCard';

import { PropsFromRedux } from '../containers/SiloStatsContainer';

interface ISiloStatsProps {
  tokenSymbol?: string
}

export default function SiloStats(props: PropsFromRedux & ISiloStatsProps) {

  let {
    tokenSymbol
  } = props;

  const [siloOverview, setSiloOverview] = useState<ISilo | undefined>();
  
  useEffect(() => {
    fetch(`${API_ENDPOINT}/silo/${tokenSymbol}`).then(resp => resp.json())
    .then(response => {
      let rateOrder = [tokenSymbol, "XAI", "WETH"];
      if(response?.data) {
        if(response?.data?.latest_rates) {
          response.data.latest_rates = response?.data?.latest_rates.sort((a: IRate, b: IRate) => rateOrder.indexOf(a?.asset?.symbol) - rateOrder.indexOf(b?.asset?.symbol));
        }
        setSiloOverview(response?.data);
      } else {
        setSiloOverview(undefined);
      }
    })
  }, [tokenSymbol])

  return (
    <>
      <Typography variant="h4" style={{marginBottom: 12, textAlign: "center"}}>Overview</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <SingleStatCard
            title={"TVL + Borrowed"}
            value={(siloOverview?.borrowed && siloOverview?.tvl) ? priceFormat(Number(addNumbers(siloOverview?.borrowed, siloOverview?.tvl)), 2, "$") : ""}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <SingleStatCard
            title={"TVL"}
            value={siloOverview?.tvl ? priceFormat(siloOverview?.tvl, 2, "$") : ""}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <SingleStatCard
            title={"Borrowed"}
            value={siloOverview?.borrowed ? priceFormat(siloOverview?.borrowed, 2, "$") : ""}
          />
        </Grid>
      </Grid>
      <Typography variant="h4" style={{marginTop: 24, marginBottom: 12, textAlign: "center"}}>Rates</Typography>
      <Grid container spacing={2}>
        {siloOverview && siloOverview.latest_rates && siloOverview.latest_rates.map((entry) => 
          <Grid item xs={12} sm={6} md={4}>
            <SingleStatCard
              title={entry?.asset?.symbol ? entry.asset.symbol : ""}
              subtitle={entry?.side ? entry.side : ""}
              value={entry?.rate ? priceFormat(entry.rate, 2, "%", false) : ""}
            />
          </Grid>
        )}
      </Grid>
    </>
  );
}