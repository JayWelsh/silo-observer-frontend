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

interface ITimeseries {
    date: string;
    value: number;
}

interface IDateToValue {
  [key: string]: string[];
}

interface IDailyActiveUsersSelectionProps {
  tokenSymbol?: string;
  isConsideredMobile: boolean;
  overrideHandleSiloZoneChange?: (arg0: SelectChangeEvent<string>) => void;
}

const DailyActiveUsersChartSelection = (props: IDailyActiveUsersSelectionProps) => {

  const {
    tokenSymbol,
    isConsideredMobile,
    overrideHandleSiloZoneChange,
  } = props;

  let navigate = useNavigate();

  const [dailyActiveUsersTimeseries, setDailyActiveUsersTimeseries] = useState<ITimeseries[]>([]);

  const [chartSelection, setChartSelection] = useState<string>('daily-active-users');
  const [siloZoneSelection, setSiloZoneSelection] = useState<string>('user-metrics');

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
    setDailyActiveUsersTimeseries([]);
    Promise.all([
        fetch(`${API_ENDPOINT}/events/borrow/distinct-daily-users`).then(resp => resp.json()),
        fetch(`${API_ENDPOINT}/events/deposit/distinct-daily-users`).then(resp => resp.json()),
        fetch(`${API_ENDPOINT}/events/repay/distinct-daily-users`).then(resp => resp.json()),
        fetch(`${API_ENDPOINT}/events/withdraw/distinct-daily-users`).then(resp => resp.json()),
    ]).then((data) => {

      let borrowEventsDistinctDailyUsers = data[0].data.reverse();
      let depositEventsDistinctDailyUsers = data[1].data.reverse();
      let repayEventsDistinctDailyUsers = data[2].data.reverse();
      let withdrawEventsDistinctDailyUsers = data[3].data.reverse();

      let dateToUniqueAddresses : IDateToValue = {};

      for(let entry of borrowEventsDistinctDailyUsers) {
        if(!dateToUniqueAddresses[entry.block_day_timestamp]) {
          dateToUniqueAddresses[entry.block_day_timestamp] = [entry.user_address]
        } else if (dateToUniqueAddresses[entry.block_day_timestamp].indexOf(entry.user_address) === -1) {
          dateToUniqueAddresses[entry.block_day_timestamp].push(entry.user_address)
        }
      }

      for(let entry of depositEventsDistinctDailyUsers) {
        if(!dateToUniqueAddresses[entry.block_day_timestamp]) {
          dateToUniqueAddresses[entry.block_day_timestamp] = [entry.user_address]
        } else if (dateToUniqueAddresses[entry.block_day_timestamp].indexOf(entry.user_address) === -1) {
          dateToUniqueAddresses[entry.block_day_timestamp].push(entry.user_address)
        }
      }

      for(let entry of repayEventsDistinctDailyUsers) {
        if(!dateToUniqueAddresses[entry.block_day_timestamp]) {
          dateToUniqueAddresses[entry.block_day_timestamp] = [entry.user_address]
        } else if (dateToUniqueAddresses[entry.block_day_timestamp].indexOf(entry.user_address) === -1) {
          dateToUniqueAddresses[entry.block_day_timestamp].push(entry.user_address)
        }
      }

      for(let entry of withdrawEventsDistinctDailyUsers) {
        if(!dateToUniqueAddresses[entry.block_day_timestamp]) {
          dateToUniqueAddresses[entry.block_day_timestamp] = [entry.user_address]
        } else if (dateToUniqueAddresses[entry.block_day_timestamp].indexOf(entry.user_address) === -1) {
          dateToUniqueAddresses[entry.block_day_timestamp].push(entry.user_address)
        }
      }

      let dailyActiveUsersTimeseries : ITimeseries[] = [];

      dailyActiveUsersTimeseries.push({
        date: "2022-08-18T00:00:00.000Z",
        value: 0,
      })

      for(let [key, value] of Object.entries(dateToUniqueAddresses)) {
        dailyActiveUsersTimeseries.push({
          date: key,
          value: value.length,
        })
      }

      dailyActiveUsersTimeseries = dailyActiveUsersTimeseries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setDailyActiveUsersTimeseries(dailyActiveUsersTimeseries);

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
        <FormControl fullWidth style={{marginBottom: 24, marginRight: 0, maxWidth: isConsideredMobile ? '100%' : 200}}>
            <InputLabel id="demo-simple-select-label">Chart Selection</InputLabel>
            <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={chartSelection}
                label="Chart Selection"
                onChange={handleChange}
            >
                <MenuItem value={'daily-active-users'}>Daily Unique Users</MenuItem>
            </Select>
        </FormControl>
      </div>
      {chartSelection === "daily-active-users" && dailyActiveUsersTimeseries && dailyActiveUsersTimeseries.length > 0 &&
          <>
              <div>
                  <div style={{width: '100%'}}>
                      <BasicAreaChartContainer
                          chartData={dailyActiveUsersTimeseries}
                          leftTextTitle={`${tokenSymbol ? `${tokenSymbol} Silo` : 'All Silos'}`}
                          leftTextSubtitle={`Unique Daily Users`}
                          rightText={priceFormat(dailyActiveUsersTimeseries[dailyActiveUsersTimeseries.length - 1].value, 0, 'Users', false)}
                          showChange={true}
                          changeType={"up-good"}
                          height={500}
                          formatValueFn={(value: any) => priceFormat(value, 0, "Users")}
                          hideTime={true}
                      />
                  </div>
              </div>
          </>
      }
    </>
  )
};

export default DailyActiveUsersChartSelection;