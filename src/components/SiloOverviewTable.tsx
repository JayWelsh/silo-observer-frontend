import React, { useEffect, useState } from 'react';

import { 
  XAI_ADDRESS_ETH_MAINNET,
  WETH_ADDRESS_ETH_MAINNET,
  DEPLOYMENT_ID_TO_HUMAN_READABLE,
} from '../constants';
import { ISilo } from '../interfaces';

import SortableTable from './SortableTable';

import { PropsFromRedux } from '../containers/SiloOverviewTableContainer';

import { priceFormat } from "../utils";

import LlamaLogo from "../assets/png/llama.png";

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

const networkImageGetter = ((network: string) => {
  switch(network) {
    case "ethereum":
      return "https://vagabond-public-storage.s3.eu-west-2.amazonaws.com/ethereum-logo.png";
    case "arbitrum":
      return "https://vagabond-public-storage.s3.eu-west-2.amazonaws.com/arbitrum-logo.svg";
    default:
      return "";
  }
})

const deploymentImageGetter = ((deploymentID: string) => {
  switch(deploymentID) {
    case "ethereum-llama":
      return LlamaLogo;
    default:
      return "https://vagabond-public-storage.s3.eu-west-2.amazonaws.com/silo-circle.png";
  }
})

const internalLinkGetter = ((symbol: string, deploymentID: string) => `/silo/${deploymentID}/${symbol}/tvl`)

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
        network,
        deployment_id,
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
        network,
        deploymentID: deployment_id,
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
            id: 'silo-overview-table-network-col',
            label: 'Network',
            valueKey: 'network',
            numeric: false,
            disablePadding: false,
            imageGetter: networkImageGetter,
            valueFormatter: (str: string) => `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`
          },
          {
            id: 'silo-overview-table-deployment-col',
            label: 'Deployment',
            valueKey: 'deploymentID',
            numeric: false,
            disablePadding: false,
            imageGetter: deploymentImageGetter,
            valueFormatter: (str: string) => `${DEPLOYMENT_ID_TO_HUMAN_READABLE[str]}`
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