import React, { useEffect, useState } from 'react';

import Card from '@mui/material/Card';

import { API_ENDPOINT } from '../constants';

import { IPieData, IAsset } from '../interfaces';

import { PropsFromRedux } from '../containers/SiloOverviewTableContainer';
import PieChartContainer from '../containers/PieChartContainer';

interface IDataReponse {
  tvl: string;
  asset: IAsset;
}

export default function SiloTotalAssetComposition(props: PropsFromRedux) {

  const [pieData, setPieData] = useState<IPieData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch(`${API_ENDPOINT}/tvl-totals/latest/assets/whole-platform`).then(resp => resp.json()),
    ]).then((data) => {

      setIsLoading(false);

      let pieDataResponse : IDataReponse[] = data[0].data;

      let totalTvl = pieDataResponse.reduce((acc: number, entry: IDataReponse) => {
        return acc + Number(entry.tvl);
      }, 0);

      let runningTotal = 0;
      let otherRecord : IPieData = {
        name: "Other",
        value: 0,
        groupedData: [],
      };

      let formattedPieData : IPieData[] = pieDataResponse.sort((a, b) => Number(a) - Number(b)).map((entry) => {
        let markForRemoval = false;
        let percentageOfWhole = Number(((Number(entry.tvl) * 100) / totalTvl).toFixed(2));
        runningTotal += percentageOfWhole;
        if((runningTotal > 95) && (percentageOfWhole < 1)) {
          otherRecord.value += percentageOfWhole;
          if(otherRecord.groupedData) {
            otherRecord.groupedData.push({
              name: entry.asset.symbol,
              value: percentageOfWhole,
            })
          }
          markForRemoval = true;
        }
        return {
          name: entry.asset.symbol,
          value: percentageOfWhole,
          markForRemoval,
        }
      }).filter((entry) => !entry.markForRemoval);

      if(otherRecord.value > 0) {
        formattedPieData.push(otherRecord);
      }

      setPieData(formattedPieData);

    })
  }, [])

  return (
    <Card style={{paddingLeft: 16, paddingRight: 16, paddingTop: 16}}>
      <PieChartContainer data={pieData} loading={isLoading} title={"Asset Composition"}/>
    </Card>
  );
}