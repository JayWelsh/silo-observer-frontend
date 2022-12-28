import React, { useEffect, useState } from 'react';

import { 
  XAI_ADDRESS_ETH_MAINNET,
  WETH_ADDRESS_ETH_MAINNET,
} from '../constants';
import { ISilo } from '../interfaces';

import SortableTable from './SortableTable';

import { PropsFromRedux } from '../containers/SiloOverviewTableContainer';

import { priceFormat } from "../utils";

interface ISiloSearchProps {
  siloOverviews: ISilo[]
}

interface ISiloOverviewData {
  name: string;
  tvl: number;
  borrowed: number;
  baseBorrowRate: number | undefined;
  baseLendRate: number | undefined;
  wethBorrowRate: number | undefined;
  wethLendRate: number | undefined;
  xaiBorrowRate: number | undefined;
  xaiLendRate: number | undefined;
}

const imageGetter = ((symbol: string) => `https://app.silo.finance/images/logos/${symbol}.png`)

const internalLinkGetter = ((symbol: string) => `/silo/${symbol}/tvl`)

export default function SiloOverviewTable(props: PropsFromRedux & ISiloSearchProps) {
  const [siloOverviewData, setSiloOverviewData] = useState<ISiloOverviewData[]>([]);

  let {
    siloOverviews,
  } = props;

  useEffect(() => {
    let siloOverviewDataBuild = [];
    for(let silo of siloOverviews) {
      console.log({silo})

      const {
        name,
        tvl,
        borrowed,
        input_token_address,
        latest_rates,
      } = silo;

      // build up base asset rates
      let baseBorrowRate;
      let baseLendRate;
      let wethBorrowRate;
      let wethLendRate;
      let xaiBorrowRate;
      let xaiLendRate;

      for(let rate of latest_rates) {
        let rateValue = rate.rate;
        if(rate.asset_address === XAI_ADDRESS_ETH_MAINNET) {
          if(rate.side === "BORROWER") {
            xaiBorrowRate = rateValue;
          } else if (rate.side === "LENDER") {
            xaiLendRate = rateValue;
          }
        }
        if(rate.asset_address === WETH_ADDRESS_ETH_MAINNET) {
          if(rate.side === "BORROWER") {
            wethBorrowRate = rateValue;
          } else if (rate.side === "LENDER") {
            wethLendRate = rateValue;
          }
        }
        if(rate.asset_address === input_token_address) {
          if(rate.side === "BORROWER") {
            baseBorrowRate = rateValue;
          } else if (rate.side === "LENDER") {
            baseLendRate = rateValue;
          }
        }
      }
      
      siloOverviewDataBuild.push({
        name,
        tvl,
        borrowed,
        baseBorrowRate,
        baseLendRate,
        wethBorrowRate,
        wethLendRate,
        xaiBorrowRate,
        xaiLendRate,
      })
    }
    setSiloOverviewData(siloOverviewDataBuild)
  }, [siloOverviews])

  return (
    <>
      <SortableTable
        tableHeading="Silo Overviews"
        defaultSortValueKey="tvl"
        columnConfig={[
          {
            id: 'silo-overview-table-silo-col',
            label: 'Silo',
            valueKey: 'name',
            numeric: false,
            disablePadding: false,
            imageGetter: imageGetter,
            fallbackImage: 'https://vagabond-public-storage.s3.eu-west-2.amazonaws.com/question-mark-white.svg',
            internalLinkGetter: internalLinkGetter,
          },
          {
            id: 'silo-overview-table-tvl-col',
            label: 'TVL',
            valueKey: 'tvl',
            numeric: true,
            disablePadding: false,
            valueFormatter: priceFormat,
          },
          {
            id: 'silo-overview-table-borrowed-col',
            label: 'Borrowed',
            valueKey: 'borrowed',
            numeric: true,
            disablePadding: false,
            valueFormatter: priceFormat,
          },
          {
            id: 'silo-overview-table-base-borrow-apy-col',
            label: 'Base Borrow APY',
            valueKey: 'baseBorrowRate',
            numeric: true,
            disablePadding: false,
            valueFormatter: (value) => priceFormat(value, 2, '%', false),
          },
          {
            id: 'silo-overview-table-base-lend-apy-col',
            label: 'Base Lend APY',
            valueKey: 'baseLendRate',
            numeric: true,
            disablePadding: false,
            valueFormatter: (value) => priceFormat(value, 2, '%', false),
          },
          {
            id: 'silo-overview-table-xai-borrow-apy-col',
            label: 'XAI Borrow APY',
            valueKey: 'xaiBorrowRate',
            numeric: true,
            disablePadding: false,
            valueFormatter: (value) => priceFormat(value, 2, '%', false),
          },
          {
            id: 'silo-overview-table-xai-lend-apy-col',
            label: 'XAI Lend APY',
            valueKey: 'xaiLendRate',
            numeric: true,
            disablePadding: false,
            valueFormatter: (value) => priceFormat(value, 2, '%', false),
          },
          {
            id: 'silo-overview-table-weth-borrow-apy-col',
            label: 'WETH Borrow APY',
            valueKey: 'wethBorrowRate',
            numeric: true,
            disablePadding: false,
            valueFormatter: (value) => priceFormat(value, 2, '%', false),
          },
          {
            id: 'silo-overview-table-weth-lend-apy-col',
            label: 'WETH Lend APY',
            valueKey: 'wethLendRate',
            numeric: true,
            disablePadding: false,
            valueFormatter: (value) => priceFormat(value, 2, '%', false),
          },
        ]}
        tableData={siloOverviewData}
      />
    </>
  );
}