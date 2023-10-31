import React, { useEffect, useState } from 'react';

import Card from '@mui/material/Card';

import { API_ENDPOINT } from '../constants';

import { IPieData, IAsset } from '../interfaces';

import { PropsFromRedux } from '../containers/SiloOverviewTableContainer';
import PieChartContainer from '../containers/PieChartContainer';

interface IDataReponse {
  tvl: string | number;
  asset: IAsset;
  markForRemoval?: boolean;
}

export default function SiloTotalAssetComposition(props: PropsFromRedux) {

  const [pieData, setPieData] = useState<IPieData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch(`${API_ENDPOINT}/tvl-totals/latest/assets/whole-platform`).then(resp => resp.json()),
    ]).then((data) => {

      let pieDataResponse : IDataReponse[] = data[0].data;

      let totalTvl = pieDataResponse.reduce((acc: number, entry: IDataReponse) => {
        return acc + Number(entry.tvl);
      }, 0);

      let runningTotal = 0;
      let otherRecord : IPieData = {
        name: "Other Assets",
        value: 0,
        groupedData: [],
      };

      interface IAggregateEntry {
        tvl: number
        asset: IAsset
        addresses: string[]
      }
      interface IAggregateAssets {
        [key: string]: IAggregateEntry
      }

      let aggregateAssets : IAggregateAssets = {
        "WETH": {
          tvl: 0,
          asset: {
            symbol: "WETH",
            decimals: 18,
            address: "",
          },
          addresses: ["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"]
        },
        "USDC": {
          tvl: 0,
          asset: {
            symbol: "USDC",
            decimals: 8,
            address: "",
          },
          addresses: ["0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"]
        },
      }

      let enableAggregation = true;

      let useSourceData = pieDataResponse;
      if(enableAggregation) {
        useSourceData = pieDataResponse.map((entry) => {
          if(aggregateAssets[entry.asset.symbol] && (aggregateAssets[entry.asset.symbol].addresses.indexOf(entry.asset.address) > -1)) {
            entry.markForRemoval = true;
            aggregateAssets[entry.asset.symbol].tvl += Number(entry.tvl);
          }
          return entry;
        }).filter((entry) => !entry.markForRemoval);

        for(let [symbol, aggregateAsset] of Object.entries(aggregateAssets)) {
          if(symbol && (aggregateAsset.tvl > 0)) {
            useSourceData.push(aggregateAsset)
          }
        }
      }

      let formattedPieData : IPieData[] = useSourceData.sort((a, b) => Number(b.tvl) - Number(a.tvl)).map((entry) => {
        let markForRemoval = false;
        let percentageOfWhole = Number(((Number(entry.tvl) * 100) / totalTvl).toFixed(2));
        runningTotal += percentageOfWhole;
        if((runningTotal > 95) || (percentageOfWhole < 1)) {
          otherRecord.value += percentageOfWhole;
          if(otherRecord.groupedData) {
            if(percentageOfWhole > 0) {
              otherRecord.groupedData.push({
                name: entry.asset.symbol,
                value: percentageOfWhole,
              })
            }
          }
          markForRemoval = true;
        }
        if(percentageOfWhole === 0) {
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

      setIsLoading(false);

      setPieData(formattedPieData);

    })
  }, [])

  return (
    <Card style={{paddingLeft: 16, paddingRight: 16, paddingTop: 16}}>
      <PieChartContainer data={pieData} loading={isLoading} title={"TVL Asset Composition"}/>
    </Card>
  );
}