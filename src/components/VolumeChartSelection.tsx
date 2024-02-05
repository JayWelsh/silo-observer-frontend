import React, {useEffect, useState} from 'react';

// import Select, { SelectChangeEvent } from '@mui/material/Select';

import BigNumber from 'bignumber.js';

import { priceFormat, capitalizeFirstLetter, selectedChainIDsToDisplayString } from '../utils';

import { API_ENDPOINT, CHAIN_COUNT } from '../constants';

import BasicAreaChartContainer from '../containers/BasicAreaChartContainer';

import { IVolumeResponseEntry } from '../interfaces';

import { PropsFromRedux } from '../containers/VolumeChartSelectionContainer';

import { fillDataGapsToCurrentDate } from '../utils';

BigNumber.config({ EXPONENTIAL_AT: 1e+9 });

interface ITimeseries {
  date: string;
  value: number;
}

interface ITvlChartSelectionProps {
  volumeType: "deposit" | "withdraw" | "borrowed" | "repay" | string;
  isConsideredMobile: boolean;
  enableDailyBuffering?: boolean
  // overrideHandleSiloZoneChange?: (arg0: SelectChangeEvent<string>) => void;
}

const TvlChartSelection = (props: ITvlChartSelectionProps & PropsFromRedux) => {

  const {
    volumeType,
    // isConsideredMobile,
    selectedNetworkIDs,
    enableDailyBuffering = false,
  } = props;

  const [combinedTotalsTimeseries, setCombinedTotalsTimeseries] = useState<ITimeseries[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    setCombinedTotalsTimeseries([]);
    Promise.all([
      fetch(`${API_ENDPOINT}/volume/${volumeType}?networks=${selectedNetworkIDs.join(',')}&page=1&perPage=32000`).then(resp => resp.json()),
    ]).then((data) => {

      setIsLoading(false);

      let chartData = data[0].data.map((entry: IVolumeResponseEntry) => {
        return {
          value: Number(entry.usd),
          date: entry.day_timestamp_unix * 1000,
        }
      })

      if(enableDailyBuffering) {
        chartData = fillDataGapsToCurrentDate(chartData);
      }

      setCombinedTotalsTimeseries(chartData);

    })
  }, [volumeType, selectedNetworkIDs, enableDailyBuffering])

  return (
    <>
      {combinedTotalsTimeseries &&
          <>
              <div>
                  <div style={{width: '100%'}}>
                      <BasicAreaChartContainer
                          chartData={combinedTotalsTimeseries}
                          loading={isLoading}
                          leftTextTitle={selectedNetworkIDs.length === CHAIN_COUNT ? `All Silo Deployments` : `${selectedChainIDsToDisplayString(selectedNetworkIDs)} Silo Deployments`}
                          leftTextSubtitle={`Daily ${capitalizeFirstLetter(volumeType)} Volume`}
                          rightTextFormatValueFn={(value: any) => priceFormat(value, 2, '$')}
                          showChange={true}
                          changeType={volumeType === "withdraw" ? "neutral" : "up-good"}
                          height={500}
                          formatValueFn={(value: any) => priceFormat(value, 2, "$")}
                          utc={true}
                          hideTime={true}
                      />
                  </div>
              </div>
          </>
      }
    </>
  )
};

export default TvlChartSelection;