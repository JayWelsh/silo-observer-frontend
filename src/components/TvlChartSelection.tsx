import React, {useEffect, useState} from 'react';

import makeStyles from '@mui/styles/makeStyles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import { useEtherBalance, useEthers } from '@usedapp/core'
import { formatEther } from '@ethersproject/units'

import BigNumber from 'bignumber.js';

import { priceFormat } from '../utils';

import { API_ENDPOINT } from '../constants';

import BasicAreaChartContainer from '../components/BasicAreaChart';

import { ITimeseries } from '../components/BasicAreaChart/index';

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

interface ITokenRate {
    date: string;
    value: number;
}

interface IDateToValue {
    [key: string]: BigNumber;
}

interface ITvlChartSelectionProps {
  tokenSymbol?: string;
}

const TvlChartSelection = (props: ITvlChartSelectionProps) => {

  const { tokenSymbol } = props;

  const [tvlTotalsTimeseries, setTvlTotalsTimeseries] = useState<ITokenRate[]>([]);
  const [borrowedTotalsTimeseries, setBorrowedTotalsTimeseries] = useState<ITokenRate[]>([]);
  const [combinedTotalsTimeseries, setCombinedTotalsTimeseries] = useState<ITokenRate[]>([]);

  const [chartSelection, setChartSelection] = useState<string>('tvl+borrowed');

  const handleChange = (event: SelectChangeEvent) => {
      setChartSelection(event.target.value as string);
  };

  useEffect(() => {
    setBorrowedTotalsTimeseries([]);
    setTvlTotalsTimeseries([]);
    setCombinedTotalsTimeseries([]);
    Promise.all([
        fetch(`${API_ENDPOINT}/tvl-totals/${tokenSymbol ? `silo/${tokenSymbol}` : 'whole-platform'}?perPage=1440&resolution=minutely`).then(resp => resp.json()),
        fetch(`${API_ENDPOINT}/tvl-totals/${tokenSymbol ? `silo/${tokenSymbol}` : 'whole-platform'}?perPage=1440&resolution=hourly`).then(resp => resp.json()),
        fetch(`${API_ENDPOINT}/borrowed-totals/${tokenSymbol ? `silo/${tokenSymbol}` : 'whole-platform'}?perPage=1440&resolution=minutely`).then(resp => resp.json()),
        fetch(`${API_ENDPOINT}/borrowed-totals/${tokenSymbol ? `silo/${tokenSymbol}` : 'whole-platform'}?perPage=1440&resolution=hourly`).then(resp => resp.json()),
    ]).then((data) => {
      console.log({data});

      let tvlTotalsDataMinutely = data[0].data.reverse();
      let tvlTotalsDataHourly = data[1].data.reverse();
      let borrowTotalsDataMinutely = data[2].data.reverse();
      let borrowTotalsDataHourly = data[3].data.reverse();

      let tvlTotalsTimeseriesTemp : ITokenRate[] = [];
      let borrowTotalsTimeseriesTemp : ITokenRate[] = [];
      let combinedTotalsTimeseriesTemp : ITokenRate[] = [];

      let dateToTvlTotalValue : IDateToValue = {};
      let dateToBorrowTotalValue : IDateToValue = {};
      let dateToCombinedValue : IDateToValue = {};

      for(let entry of tvlTotalsDataMinutely) {
          tvlTotalsTimeseriesTemp.push({
              date: entry.timestamp,
              value: Number(entry.tvl)
          })
          if(!dateToTvlTotalValue[entry.timestamp]) {
            dateToTvlTotalValue[entry.timestamp] = new BigNumber(entry.tvl);
          }
          if(!dateToCombinedValue[entry.timestamp]) {
              dateToCombinedValue[entry.timestamp] = new BigNumber(entry.tvl);
          } else {
              dateToCombinedValue[entry.timestamp] = dateToCombinedValue[entry.timestamp].plus(entry.tvl);
          }
      }

      for(let entry of tvlTotalsDataHourly) {
        if(!dateToTvlTotalValue[entry.timestamp]) {
          tvlTotalsTimeseriesTemp.push({
              date: entry.timestamp,
              value: Number(entry.tvl)
          })
          if(!dateToCombinedValue[entry.timestamp]) {
            dateToCombinedValue[entry.timestamp] = new BigNumber(entry.tvl);
          } else {
            dateToCombinedValue[entry.timestamp] = dateToCombinedValue[entry.timestamp].plus(entry.tvl);
          }
        }
      }

      for(let entry of borrowTotalsDataMinutely) {
        borrowTotalsTimeseriesTemp.push({
            date: entry.timestamp,
            value: Number(entry.borrowed)
        });
        if(!dateToBorrowTotalValue[entry.timestamp]) {
          dateToBorrowTotalValue[entry.timestamp] = new BigNumber(entry.borrowed);
        }
        if(!dateToCombinedValue[entry.timestamp]) {
            dateToCombinedValue[entry.timestamp] = new BigNumber(entry.borrowed);
        } else {
            dateToCombinedValue[entry.timestamp] = dateToCombinedValue[entry.timestamp].plus(entry.borrowed);
        }
      }

      for(let entry of borrowTotalsDataHourly) {
        if(!dateToBorrowTotalValue[entry.timestamp]) {
          borrowTotalsTimeseriesTemp.push({
              date: entry.timestamp,
              value: Number(entry.borrowed)
          });
          if(!dateToCombinedValue[entry.timestamp]) {
              dateToCombinedValue[entry.timestamp] = new BigNumber(entry.borrowed);
          } else {
              dateToCombinedValue[entry.timestamp] = dateToCombinedValue[entry.timestamp].plus(entry.borrowed);
          }
        } else {
          console.log(`dateToBorrowTotalValue already contains a record for ${entry.timestamp}`)
        }
      }

      for(let entry of Object.entries(dateToCombinedValue)) {
        combinedTotalsTimeseriesTemp.push({
            date: entry[0],
            value: entry[1].toNumber()
        })
      }

      // Sort borrowTotalsTimeseriesTemp
      borrowTotalsTimeseriesTemp = borrowTotalsTimeseriesTemp.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Sort tvlTotalsTimeseriesTemp
      tvlTotalsTimeseriesTemp = tvlTotalsTimeseriesTemp.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Sort combinedTotalsTimeseriesTemp
      combinedTotalsTimeseriesTemp = combinedTotalsTimeseriesTemp.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setBorrowedTotalsTimeseries(borrowTotalsTimeseriesTemp);
      setTvlTotalsTimeseries(tvlTotalsTimeseriesTemp);
      setCombinedTotalsTimeseries(combinedTotalsTimeseriesTemp);

    })
  }, [tokenSymbol])

  return (
    <>
      <FormControl fullWidth style={{marginBottom: 25, maxWidth: 180}}>
          <InputLabel id="demo-simple-select-label">Chart Selection</InputLabel>
          <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={chartSelection}
              label="Chart Selection"
              onChange={handleChange}
          >
              <MenuItem value={'tvl+borrowed'}>TVL + Borrowed</MenuItem>
              <MenuItem value={'tvl'}>TVL</MenuItem>
              <MenuItem value={'borrowed'}>Borrowed</MenuItem>
          </Select>
      </FormControl>
      {chartSelection === "tvl" && tvlTotalsTimeseries && tvlTotalsTimeseries.length > 0 &&
          <>
              <div style={{marginBottom: 50}}>
                  <div style={{width: '100%'}}>
                      <BasicAreaChartContainer
                          chartData={tvlTotalsTimeseries}
                          leftTextTitle={`${tokenSymbol ? `${tokenSymbol} Silo` : 'All Silos'}`}
                          leftTextSubtitle={`TVL`}
                          rightText={priceFormat(tvlTotalsTimeseries[tvlTotalsTimeseries.length - 1].value, 2, '$')}
                          showChange={true}
                          changeType={"up-good"}
                          height={500}
                          formatValueFn={(value: any) => priceFormat(value, 2, "$")}
                      />
                  </div>
              </div>
          </>
      }
      {chartSelection === "borrowed" && borrowedTotalsTimeseries && borrowedTotalsTimeseries.length > 0 &&
          <>
              <div style={{marginBottom: 50}}>
                  <div style={{width: '100%'}}>
                      <BasicAreaChartContainer
                          chartData={borrowedTotalsTimeseries}
                          leftTextTitle={`${tokenSymbol ? `${tokenSymbol} Silo` : 'All Silos'}`}
                          leftTextSubtitle={`Borrowed`}
                          rightText={priceFormat(borrowedTotalsTimeseries[borrowedTotalsTimeseries.length - 1].value, 2, '$')}
                          showChange={true}
                          changeType={"up-good"}
                          height={500}
                          formatValueFn={(value: any) => priceFormat(value, 2, "$")}
                      />
                  </div>
              </div>
          </>
      }
      {chartSelection === "tvl+borrowed" && combinedTotalsTimeseries && combinedTotalsTimeseries.length > 0 &&
          <>
              <div style={{marginBottom: 50}}>
                  <div style={{width: '100%'}}>
                      <BasicAreaChartContainer
                          chartData={combinedTotalsTimeseries}
                          leftTextTitle={`${tokenSymbol ? `${tokenSymbol} Silo` : 'All Silos'}`}
                          leftTextSubtitle={`TVL + Borrows`}
                          rightText={priceFormat(combinedTotalsTimeseries[combinedTotalsTimeseries.length - 1].value, 2, '$')}
                          showChange={true}
                          changeType={"up-good"}
                          height={500}
                          formatValueFn={(value: any) => priceFormat(value, 2, "$")}
                      />
                  </div>
              </div>
          </>
      }
    </>
  )
};

export default TvlChartSelection;