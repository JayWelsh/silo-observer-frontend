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

interface ITvlEntry {
  tvl: string
  timestamp: string
  meta: string
  duplicateCount: number
}

interface IDateToTvlEntry {
  [key: string]: ITvlEntry
}

interface IBorrowEntry {
  borrowed: string
  timestamp: string
  meta: string
  duplicateCount: number
}

interface IDateToBorrowEntry {
  [key: string]: IBorrowEntry
}

interface ITvlChartSelectionProps {
  tokenSymbol?: string;
  isConsideredMobile: boolean;
  overrideHandleSiloZoneChange?: (arg0: SelectChangeEvent<string>) => void;
}

const TvlChartSelection = (props: ITvlChartSelectionProps) => {

  const {
    tokenSymbol,
    isConsideredMobile,
    overrideHandleSiloZoneChange,
  } = props;

  let navigate = useNavigate();

  const [tvlTotalsTimeseries, setTvlTotalsTimeseries] = useState<ITokenRate[]>([]);
  const [borrowedTotalsTimeseries, setBorrowedTotalsTimeseries] = useState<ITokenRate[]>([]);
  const [combinedTotalsTimeseries, setCombinedTotalsTimeseries] = useState<ITokenRate[]>([]);

  const [chartSelection, setChartSelection] = useState<string>('tvl+borrowed');
  const [siloZoneSelection, setSiloZoneSelection] = useState<string>('tvl+borrowed');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleChange = (event: SelectChangeEvent) => {
    setChartSelection(event.target.value as string);
  };

  const handleSiloZoneChange = (event: SelectChangeEvent) => {
    let value = event.target.value as string;
    setSiloZoneSelection(value)
    if(overrideHandleSiloZoneChange) {
      overrideHandleSiloZoneChange(event);
    } else {
      if(value === 'rates') {
        navigate(`/silo/${tokenSymbol}/rates`);
      }
    }
  };

  useEffect(() => {
    setIsLoading(true);
    setBorrowedTotalsTimeseries([]);
    setTvlTotalsTimeseries([]);
    setCombinedTotalsTimeseries([]);
    Promise.all([
        fetch(`${API_ENDPOINT}/tvl-totals/${tokenSymbol ? `silo/${tokenSymbol}` : 'whole-platform'}?perPage=1440&resolution=minutely`).then(resp => resp.json()),
        fetch(`${API_ENDPOINT}/tvl-totals/${tokenSymbol ? `silo/${tokenSymbol}` : 'whole-platform'}?perPage=1440&resolution=hourly`).then(resp => resp.json()),
        fetch(`${API_ENDPOINT}/borrowed-totals/${tokenSymbol ? `silo/${tokenSymbol}` : 'whole-platform'}?perPage=1440&resolution=minutely`).then(resp => resp.json()),
        fetch(`${API_ENDPOINT}/borrowed-totals/${tokenSymbol ? `silo/${tokenSymbol}` : 'whole-platform'}?perPage=1440&resolution=hourly`).then(resp => resp.json()),
    ]).then((data) => {

      setIsLoading(false);

      let currentNetworkCount = 2;

      let tvlTotalsDataMinutely = data[0].data.reverse();
      let tvlTotalsDataHourly = data[1].data.reverse();
      let borrowTotalsDataMinutely = data[2].data.reverse();
      let borrowTotalsDataHourly = data[3].data.reverse();

      let tvlTotalsDataMinutelyTimeToEntry : IDateToTvlEntry = {};
      let tvlTotalsDataHourlyTimeToEntry : IDateToTvlEntry = {};
      let borrowTotalsDataMinutelyTimeToEntry : IDateToBorrowEntry = {};
      let borrowTotalsDataHourlyTimeToEntry : IDateToBorrowEntry = {};

      let tvlTotalsTimeseriesTemp : ITokenRate[] = [];
      let borrowTotalsTimeseriesTemp : ITokenRate[] = [];
      let combinedTotalsTimeseriesTemp : ITokenRate[] = [];

      let dateToTvlTotalValue : IDateToValue = {};
      let dateToBorrowTotalValue : IDateToValue = {};
      let dateToCombinedValue : IDateToValue = {};


      for(let entry of tvlTotalsDataMinutely) {
        if(!tvlTotalsDataMinutelyTimeToEntry[entry.timestamp]) {
          tvlTotalsDataMinutelyTimeToEntry[entry.timestamp] = entry;
          tvlTotalsDataMinutelyTimeToEntry[entry.timestamp].duplicateCount = 1;
        } else {
          tvlTotalsDataMinutelyTimeToEntry[entry.timestamp].tvl = new BigNumber(tvlTotalsDataMinutelyTimeToEntry[entry.timestamp].tvl).plus(entry.tvl).toString();
          tvlTotalsDataMinutelyTimeToEntry[entry.timestamp].duplicateCount++;
        }
      }

      for(let [timestamp, entry] of Object.entries(tvlTotalsDataMinutelyTimeToEntry)) {
        if(entry.duplicateCount === currentNetworkCount) {
          tvlTotalsTimeseriesTemp.push({
              date: timestamp,
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
      }

      for(let entry of tvlTotalsDataHourly) {
        if(!tvlTotalsDataHourlyTimeToEntry[entry.timestamp]) {
          tvlTotalsDataHourlyTimeToEntry[entry.timestamp] = entry;
        } else {
          tvlTotalsDataHourlyTimeToEntry[entry.timestamp].tvl = new BigNumber(tvlTotalsDataHourlyTimeToEntry[entry.timestamp].tvl).plus(entry.tvl).toString();
        }
      }

      for(let [timestamp, entry] of Object.entries(tvlTotalsDataHourlyTimeToEntry)) {
        if(!dateToTvlTotalValue[entry.timestamp]) {
          tvlTotalsTimeseriesTemp.push({
              date: timestamp,
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
        if(!borrowTotalsDataMinutelyTimeToEntry[entry.timestamp]) {
          borrowTotalsDataMinutelyTimeToEntry[entry.timestamp] = entry;
          borrowTotalsDataMinutelyTimeToEntry[entry.timestamp].duplicateCount = 1;
        } else {
          borrowTotalsDataMinutelyTimeToEntry[entry.timestamp].borrowed = new BigNumber(borrowTotalsDataMinutelyTimeToEntry[entry.timestamp].borrowed).plus(entry.borrowed).toString();
          borrowTotalsDataMinutelyTimeToEntry[entry.timestamp].duplicateCount++;
        }
      }

      for(let [timestamp, entry] of Object.entries(borrowTotalsDataMinutelyTimeToEntry)) {
        if(entry.duplicateCount === currentNetworkCount) {
          borrowTotalsTimeseriesTemp.push({
              date: timestamp,
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
      }

      for(let entry of borrowTotalsDataHourly) {
        if(!borrowTotalsDataHourlyTimeToEntry[entry.timestamp]) {
          borrowTotalsDataHourlyTimeToEntry[entry.timestamp] = entry;
          borrowTotalsDataHourlyTimeToEntry[entry.timestamp].duplicateCount = 1;
        } else {
          borrowTotalsDataHourlyTimeToEntry[entry.timestamp].borrowed = new BigNumber(borrowTotalsDataHourlyTimeToEntry[entry.timestamp].borrowed).plus(entry.borrowed).toString();
          borrowTotalsDataHourlyTimeToEntry[entry.timestamp].duplicateCount++;
        }
      }

      for(let [timestamp, entry] of Object.entries(borrowTotalsDataHourlyTimeToEntry)) {
        if(!dateToBorrowTotalValue[entry.timestamp]) {
          borrowTotalsTimeseriesTemp.push({
              date: timestamp,
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
          onError={({ currentTarget }) => {
            currentTarget.onerror = null; // prevents looping
            currentTarget.src="https://vagabond-public-storage.s3.eu-west-2.amazonaws.com/question-mark-white.svg";
          }}
          alt="selected silo logo"
        />
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
                {tokenSymbol && <MenuItem value={'rates'}>Rates</MenuItem>}
                {!tokenSymbol && <MenuItem value={'user-metrics'}>User Metrics</MenuItem>}
            </Select>
        </FormControl>
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
      {chartSelection === "tvl" && tvlTotalsTimeseries &&
          <>
              <div>
                  <div style={{width: '100%'}}>
                      <BasicAreaChartContainer
                          chartData={tvlTotalsTimeseries}
                          loading={isLoading}
                          leftTextTitle={`${tokenSymbol ? `${tokenSymbol} Silo` : 'All Silos'}`}
                          leftTextSubtitle={`TVL`}
                          rightTextFormatValueFn={(value: any) => priceFormat(value, 2, '$')}
                          showChange={true}
                          changeType={"up-good"}
                          height={500}
                          formatValueFn={(value: any) => priceFormat(value, 2, "$")}
                      />
                  </div>
              </div>
          </>
      }
      {chartSelection === "borrowed" && borrowedTotalsTimeseries &&
          <>
              <div>
                  <div style={{width: '100%'}}>
                      <BasicAreaChartContainer
                          chartData={borrowedTotalsTimeseries}
                          loading={isLoading}
                          leftTextTitle={`${tokenSymbol ? `${tokenSymbol} Silo` : 'All Silos'}`}
                          leftTextSubtitle={`Borrowed`}
                          rightTextFormatValueFn={(value: any) => priceFormat(value, 2, '$')}
                          showChange={true}
                          changeType={"up-good"}
                          height={500}
                          formatValueFn={(value: any) => priceFormat(value, 2, "$")}
                      />
                  </div>
              </div>
          </>
      }
      {chartSelection === "tvl+borrowed" && combinedTotalsTimeseries &&
          <>
              <div>
                  <div style={{width: '100%'}}>
                      <BasicAreaChartContainer
                          chartData={combinedTotalsTimeseries}
                          loading={isLoading}
                          leftTextTitle={`${tokenSymbol ? `${tokenSymbol} Silo` : 'All Silos'}`}
                          leftTextSubtitle={`TVL + Borrows`}
                          rightTextFormatValueFn={(value: any) => priceFormat(value, 2, '$')}
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