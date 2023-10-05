import React, { useEffect, useState } from 'react';

import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

import { PropsFromRedux } from '../containers/SiloTokenBarContainer';

import {
  priceFormat,
} from '../utils';

import {
  ISiloTokenDataResponse,
  ISiloTokenDataResponseData,
} from '../interfaces';

const Bar = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  // marginBottom: theme.spacing(2),
  backgroundColor: 'black',
  paddingTop: theme.spacing(0.5),
  paddingBottom: theme.spacing(0.5),
}));

const StatBlock = styled('div')(({ theme }) => ({
  marginLeft: theme.spacing(2),
  marginRight: theme.spacing(2),
  fontWeight: 400,
}));

const SiloTokenBar = (props: PropsFromRedux) => {

  const {
    isConsideredMobile,
  } = props;

  const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState(new Date().getTime());
  const [fetchIndex, setFetchIndex] = useState(0);
  const [siloTokenData, setSiloTokenData] = useState<ISiloTokenDataResponseData | false>(false);
  const [isLoading, setIsLoading] = useState(false);

  // const autoUpdatePeriod = 30;
  const autoUpdatePeriod = 10;

  useEffect(() => {
    let isMounted = true;
    console.log({fetchIndex})
    const refreshSiloTokenBar = async () => {
      setIsLoading(true);
      await Promise.all([
        fetch(`https://api.cryptocape.com/asset/ethereum/0x6f80310CA7F2C654691D1383149Fa1A57d8AB1f8`).then(resp => resp.json()),
      ]).then(async (data: any) => {
        const [siloDataResponse] = data;
        const { data: siloData } : ISiloTokenDataResponse = siloDataResponse;
        if(isMounted) {
          setSiloTokenData(siloData);
          setLastUpdateTimestamp(new Date().getTime());
          setIsLoading(false);
        }
      }).catch(async (e) => {
        setIsLoading(false);
      })
    }
    refreshSiloTokenBar();
    return () => {
      isMounted = false;
    }
  }, [fetchIndex])

  useEffect(() => {

    let isMounted = true;

    const timetrackerIntervalId = setInterval(async () => {
      let useCurrentTimestamp = new Date().getTime();
      let secondsSinceLastUpdate = Number(((useCurrentTimestamp - lastUpdateTimestamp) / 1000).toFixed(0));
      if(secondsSinceLastUpdate > 0) {
        if(((secondsSinceLastUpdate % autoUpdatePeriod === 0) || (secondsSinceLastUpdate > (autoUpdatePeriod + 5))) && !isLoading) {
          if(isMounted) {
            setFetchIndex(fetchIndex + 1);
            return;
          }
        }
      }
    }, 1000);

    return () => {
      clearInterval(timetrackerIntervalId)
      isMounted = false;
    };
  });

  return (
    <Bar
      style={siloTokenData ? {
        backgroundColor: Number(siloTokenData.change_24hr_usd_percent) >= 0 ? "#011f00" : "#1f0000",
        background: Number(siloTokenData.change_24hr_usd_percent) >= 0 ? "linear-gradient(0deg, rgba(2,40,0,1) 0%, rgba(0,0,0,1) 100%)" : "linear-gradient(0deg, rgba(30,0,0,1) 0%, rgba(0,0,0,1) 100%)"
      } : {}}
    >
      {isConsideredMobile && 
      <>
        <StatBlock>
          <Typography variant="subtitle2" style={{fontWeight: 400}}>
            SILO:&nbsp;
            <span style={{fontWeight: 'bold'}}>
              {!siloTokenData && `Loading...`}
              {siloTokenData && `${priceFormat(Number(siloTokenData.last_price_usd), 3, "$")} (`}
              {siloTokenData &&
                <span style={{ color: Number(siloTokenData.change_24hr_usd_percent) >= 0 ? "#32cd32" : "red" }}>
                  {`${Number(siloTokenData.change_24hr_usd_percent) >= 0 ? '+' : '-'} ${priceFormat(Number(siloTokenData.change_24hr_usd_percent.replace('-', '')), 2, "%", false)}`}
                </span>
              }
              {siloTokenData && `)`}
            </span>
          </Typography>
        </StatBlock>
      </>
      }
      {!isConsideredMobile && 
        <>
          <StatBlock>
            <Typography variant="subtitle2" style={{fontWeight: 400}}>
              SILO: <span style={{fontWeight: 'bold'}}>{siloTokenData ? `${priceFormat(Number(siloTokenData.last_price_usd), 3, "$")}` : 'Loading...'}</span>
            </Typography>
          </StatBlock>
          <StatBlock>
            <Typography variant="subtitle2" style={{fontWeight: 400}}>
              24 Hr Change: <span style={{fontWeight: 'bold', ...(siloTokenData && { color: Number(siloTokenData.change_24hr_usd_percent) >= 0 ? "#32cd32" : "red" }) }}>{siloTokenData ? `${Number(siloTokenData.change_24hr_usd_percent) >= 0 ? '+' : '-'} ${priceFormat(Number(siloTokenData.change_24hr_usd_percent.replace('-', '')), 2, "%", false)}` : 'Loading...'}</span>
            </Typography>
          </StatBlock>
          <StatBlock>
            <Typography variant="subtitle2" style={{fontWeight: 400}}>
              Mkt Cap: <span style={{fontWeight: 'bold'}}>{siloTokenData ? `${priceFormat(Number(siloTokenData.market_cap_usd), 2, "$")}` : 'Loading...'}</span>
            </Typography>
          </StatBlock>
          <StatBlock>
            <Typography variant="subtitle2" style={{fontWeight: 400}}>
              24 Hr Vol: <span style={{fontWeight: 'bold'}}>{siloTokenData ? `${priceFormat(Number(siloTokenData.volume_24hr_usd), 2, "$")}` : 'Loading...'}</span>
            </Typography>
          </StatBlock>
        </>
      }
    </Bar>
  );

}

export default SiloTokenBar;