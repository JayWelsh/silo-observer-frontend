import React, { useEffect, useState } from 'react';

import { 
  XAI_ADDRESS_ETH_MAINNET,
  WETH_ADDRESS_ETH_MAINNET,
  CRVUSD_ADDRESS_ETH_MAINNET,
  DEPLOYMENT_ID_TO_HUMAN_READABLE,
} from '../constants';
import { ISilo } from '../interfaces';

import SortableTable from './SortableTable';

import { PropsFromRedux } from '../containers/SiloOverviewTableContainer';

import { 
  priceFormat,
  networkImageGetter,
  deploymentImageGetter,
} from "../utils";

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

const internalLinkGetter = ((symbol: string, row: any) => `/silo/${row.deploymentID}/${symbol}/tvl`)

export default function SiloOverviewTable(props: PropsFromRedux & ISiloSearchProps) {
  const [siloOverviewData, setSiloOverviewData] = useState<ISiloOverviewData[]>([]);

  let {
    siloOverviews,
    selectedNetworkIDs,
  } = props;

  useEffect(() => {
    let siloOverviewDataBuild = [];
    for(let silo of siloOverviews) {

      if(selectedNetworkIDs.indexOf(silo.network) > -1) {

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
        let baseBorrowRate = 0;
        let baseLendRate = 0;
        let wethBorrowRate = 0;
        let wethLendRate = 0;
        let xaiBorrowRate = 0;
        let xaiLendRate = 0;
        let crvUSDBorrowRate = 0;
        let crvUSDLendRate = 0;

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
          if(rate.asset_address === CRVUSD_ADDRESS_ETH_MAINNET) {
            if(rate.side === "BORROWER") {
              crvUSDBorrowRate = rateValue;
            } else if (rate.side === "LENDER") {
              crvUSDLendRate = rateValue;
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

        // for sorting by deployment ids
        let sortableDeploymentID = "";
        if(deployment_id === 'ethereum-llama') {
          sortableDeploymentID = 'a-ethereum-llama';
        } else if (deployment_id === 'ethereum-main') {
          sortableDeploymentID = 'b-ethereum-main';
        } else if (deployment_id === 'arbitrum-original') {
          sortableDeploymentID = 'c-arbitrum-original';
        } else if (deployment_id === 'optimism-original') {
          sortableDeploymentID = 'd-optimism-original';
        } else if (deployment_id === 'base-original') {
          sortableDeploymentID = 'e-base-original';
        } else if (deployment_id === 'ethereum-original') {
          sortableDeploymentID = 'f-ethereum-legacy';
        }
        
        siloOverviewDataBuild.push({
          name,
          network,
          sortableDeploymentID,
          deploymentID: deployment_id,
          tvlPlusBorrowed: Number(tvl) + Number(borrowed),
          tvl,
          borrowed,
          baseBorrowRate,
          baseLendRate,
          wethBorrowRate,
          wethLendRate,
          xaiBorrowRate,
          xaiLendRate,
          crvUSDBorrowRate,
          crvUSDLendRate,
        })
      }
    }
    setSiloOverviewData(siloOverviewDataBuild)
  }, [siloOverviews, selectedNetworkIDs])

  const standardDeployments = ['ethereum-original', 'arbitrum-original', 'optimism-original', 'base-original'];

  return (
    <>
      <SortableTable
        tableHeading="Silo Overviews"
        defaultSortValueKey="tvlPlusBorrowed"
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
            valueFormatter: (str: string) => str ? `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}` : ``
          },
          {
            id: 'silo-overview-table-deployment-col',
            label: 'Deployment',
            valueKey: 'sortableDeploymentID',
            numeric: false,
            disablePadding: false,
            imageGetter: (str: string, row: any) => deploymentImageGetter(row.deploymentID),
            valueFormatter: (str: string, row: any) => `${DEPLOYMENT_ID_TO_HUMAN_READABLE[row.deploymentID]}`
          },
          {
            id: 'silo-overview-table-tvl-plus-borrowed-col',
            label: 'TVL + Borrowed',
            valueKey: 'tvlPlusBorrowed',
            numeric: true,
            disablePadding: false,
            valueFormatter: priceFormat,
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
            id: 'silo-overview-table-crvusd-borrow-apy-col',
            label: 'crvUSD Borrow APY',
            valueKey: 'crvUSDBorrowRate',
            numeric: true,
            disablePadding: false,
            valueFormatter: (value, row) => row.deploymentID === 'ethereum-llama' ? priceFormat(value, 2, '%', false) : 'N/A',
          },
          {
            id: 'silo-overview-table-crvusd-lend-apy-col',
            label: 'crvUSD Lend APY',
            valueKey: 'crvUSDLendRate',
            numeric: true,
            disablePadding: false,
            valueFormatter: (value, row) => row.deploymentID === 'ethereum-llama' ? priceFormat(value, 2, '%', false) : 'N/A',
          },
          {
            id: 'silo-overview-table-xai-borrow-apy-col',
            label: 'XAI Borrow APY',
            valueKey: 'xaiBorrowRate',
            numeric: true,
            disablePadding: false,
            valueFormatter: (value, row) => (standardDeployments.indexOf(row.deploymentID) > -1) ? priceFormat(value, 2, '%', false) : 'N/A',
          },
          {
            id: 'silo-overview-table-xai-lend-apy-col',
            label: 'XAI Lend APY',
            valueKey: 'xaiLendRate',
            numeric: true,
            disablePadding: false,
            valueFormatter: (value, row) => (standardDeployments.indexOf(row.deploymentID) > -1) ? priceFormat(value, 2, '%', false) : 'N/A',
          },
          {
            id: 'silo-overview-table-weth-borrow-apy-col',
            label: 'WETH Borrow APY',
            valueKey: 'wethBorrowRate',
            numeric: true,
            disablePadding: false,
            valueFormatter: (value, row) => (standardDeployments.indexOf(row.deploymentID) > -1) ? priceFormat(value, 2, '%', false) : 'N/A',
          },
          {
            id: 'silo-overview-table-weth-lend-apy-col',
            label: 'WETH Lend APY',
            valueKey: 'wethLendRate',
            numeric: true,
            disablePadding: false,
            valueFormatter: (value, row) => (standardDeployments.indexOf(row.deploymentID) > -1) ? priceFormat(value, 2, '%', false) : 'N/A',
          },
        ]}
        tableData={siloOverviewData}
      />
    </>
  );
}