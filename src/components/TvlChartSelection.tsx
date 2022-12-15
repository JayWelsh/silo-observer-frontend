import React, {useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom";

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import BigNumber from 'bignumber.js';

import { priceFormat } from '../utils';

import { API_ENDPOINT } from '../constants';

import BasicAreaChartContainer from '../containers/BasicAreaChartContainer';

BigNumber.config({ EXPONENTIAL_AT: 1e+9 });

interface ITokenRate {
    date: string;
    value: number;
}

interface IDateToValue {
  [key: string]: BigNumber;
}

interface ITvlChartSelectionProps {
  tokenSymbol?: string;
  isConsideredMobile: boolean;
}

const TvlChartSelection = (props: ITvlChartSelectionProps) => {

  const { tokenSymbol, isConsideredMobile } = props;

  let navigate = useNavigate();

  const [tvlTotalsTimeseries, setTvlTotalsTimeseries] = useState<ITokenRate[]>([]);
  const [borrowedTotalsTimeseries, setBorrowedTotalsTimeseries] = useState<ITokenRate[]>([]);
  const [combinedTotalsTimeseries, setCombinedTotalsTimeseries] = useState<ITokenRate[]>([]);

  const [chartSelection, setChartSelection] = useState<string>('tvl+borrowed');
  const [siloZoneSelection, setSiloZoneSelection] = useState<string>('tvl+borrowed');

  const handleChange = (event: SelectChangeEvent) => {
    setChartSelection(event.target.value as string);
  };

  const handleSiloZoneChange = (event: SelectChangeEvent) => {
    let value = event.target.value as string;
    setSiloZoneSelection(value)
    if(value === 'rates') {
      navigate(`/silo/${tokenSymbol}/rates`);
    }
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
      <div className={isConsideredMobile ? "flex-col flex-center-all" : "flex"}>
        <img
          src={tokenSymbol ? `https://app.silo.finance/images/logos/${tokenSymbol}.png` : "https://vagabond-public-storage.s3.eu-west-2.amazonaws.com/silo-circle.png"}
          style={{
            width: 56,
            height: 56,
            marginRight: isConsideredMobile ? 0 : 24,
            marginBottom: isConsideredMobile ? 24 : 0,
          }}
          alt="selected silo logo"
        />
        {tokenSymbol &&
          <FormControl fullWidth style={{marginBottom: 24, marginRight: isConsideredMobile ? 0 : 24, maxWidth: isConsideredMobile ? '100%' : 180}}>
              <InputLabel id="select-label-silo-zone">Zone</InputLabel>
              <Select
                  labelId="select-label-silo-zone"
                  id="select-label-silo-zone"
                  value={siloZoneSelection}
                  label="Zone"
                  onChange={handleSiloZoneChange}
              >
                  <MenuItem value={'tvl+borrowed'}>TVL & Borrowed</MenuItem>
                  <MenuItem value={'rates'}>Rates</MenuItem>
              </Select>
          </FormControl>
        }
        <FormControl fullWidth style={{marginBottom: 24, marginRight: 0, maxWidth: isConsideredMobile ? '100%' : 180}}>
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
      </div>
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