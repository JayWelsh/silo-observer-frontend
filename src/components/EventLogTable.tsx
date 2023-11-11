import React, { useEffect, useState } from 'react';

import { utcFormat } from 'd3-time-format';

import dayjs from 'dayjs';

import relativeTime from 'dayjs/plugin/relativeTime';

import DepositIcon from '@mui/icons-material/MoveToInbox';
import WithdrawIcon from '@mui/icons-material/Outbox';
import BorrowIcon from '@mui/icons-material/AccountBalance';
import RepayIcon from '@mui/icons-material/CreditScore';

import {
  DEPLOYMENT_ID_TO_HUMAN_READABLE,
} from '../constants';
import { IContractEvent } from '../interfaces';

import SortableTable from './SortableTable';

import { API_ENDPOINT } from '../constants';

import { PropsFromRedux } from '../containers/SiloOverviewTableContainer';

import { 
  capitalizeFirstLetter,
  priceFormat,
  formatTokenAmount,
  tokenImageName,
  centerShortenLongString,
  getEtherscanLink,
} from "../utils";

import LlamaLogo from "../assets/png/llama.png";

dayjs.extend(relativeTime)

const formatDate = utcFormat("%b-%d-%Y %I:%M %p (UTC)");

interface IEventLogTable {
  eventType?: string
}

const iconGetter = (eventType: string, row: any) => {
  let fontSize = "1.5rem";
  let marginRight = 8;
  if(eventType === "deposit") {
    return <DepositIcon style={{fontSize, marginRight}}/>
  } else if (eventType === "withdraw") {
    return <WithdrawIcon style={{fontSize, marginRight}}/>
  } else if (eventType === "borrow") {
    return <BorrowIcon style={{fontSize, marginRight}}/>
  } else if (eventType === "repay") {
    return <RepayIcon style={{fontSize, marginRight}}/>
  }
}

const tokenImageGetter = ((amount: string, row: any) => `https://app.silo.finance/images/logos/${tokenImageName(row.asset.symbol)}.png`)

const siloImageGetter = ((amount: string, row: any) => `https://app.silo.finance/images/logos/${tokenImageName(row.silo.name)}.png`)

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

const internalLinkGetter = ((symbol: string, row: any) => `/silo/${row.deployment_id}/${row.silo.name}/tvl`)

export default function SiloOverviewTable(props: PropsFromRedux & IEventLogTable) {
  const [eventTableData, setEventTableData] = useState<IContractEvent[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [clientPage, setClientPage] = useState(0);
  const [serverPage, setServerPage] = useState(0);
  const [serverPerPage] = useState(500);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  let {
    selectedNetworkIDs,
    eventType,
  } = props;

  useEffect(() => {
    let deducedServerPage = Math.ceil((clientPage + 1) * rowsPerPage / serverPerPage) - 1;
    if(deducedServerPage !== serverPage) {
      setServerPage(deducedServerPage);
    }
  }, [clientPage, serverPage, rowsPerPage, serverPerPage])

  useEffect(() => {
    setIsLoading(true);
    let urls : Promise<any>[] = [
      fetch(`${API_ENDPOINT}/events?page=${serverPage + 1}&perPage=${serverPerPage}&networks=${selectedNetworkIDs.join(',')}`).then(resp => resp.json()),
    ];
    if(eventType) {
      urls = [
        fetch(`${API_ENDPOINT}/events/${eventType}?page=${serverPage + 1}&perPage=${serverPerPage}&networks=${selectedNetworkIDs.join(',')}`).then(resp => resp.json()),
      ]
    }
    Promise.all(urls).then((data) => {

      let [
        eventResponse,
      ] = data;

      let tableData = eventResponse.data;
      let eventPagination = eventResponse.metadata.pagination;

      setEventTableData(tableData);
      setTotalRecords(eventPagination.total);
      
      setIsLoading(false);
    })
  }, [selectedNetworkIDs, eventType, serverPage, serverPerPage])

  return (
    <>
      {
      <SortableTable
        tableHeading={eventType ? `Latest ${capitalizeFirstLetter(eventType)} Events` : `Latest Events`}
        defaultSortValueKey="block_timestamp_unix"
        tableData={eventTableData}
        totalRecords={totalRecords}
        setParentPage={setClientPage}
        setParentPerPage={setRowsPerPage}
        parentRowsPerPage={rowsPerPage}
        serverSidePagination={true}
        isLoading={isLoading}
        disableSorting={true}
        columnConfig={[
          {
            id: 'event-log-table-event-name-col',
            label: 'Event Type',
            valueKey: 'event_name',
            numeric: false,
            disablePadding: false,
            iconGetter: iconGetter,
            valueFormatter: (str: string) => capitalizeFirstLetter(str),
          },
          {
            id: 'event-log-table-event-amount-col',
            label: 'Token Amount',
            valueKey: 'amount',
            numeric: true,
            disablePadding: false,
            imageGetter: tokenImageGetter,
            valueFormatter: (str: string, row: any) => (priceFormat(formatTokenAmount(str, row.asset.decimals), 2, row.asset.symbol, false)),
          },
          {
            id: 'event-log-table-event-usd-amount-col',
            label: 'USD Amount',
            valueKey: 'usd_value_at_event_time',
            numeric: true,
            disablePadding: false,
            valueFormatter: (str: string) => (priceFormat(str, 2)),
          },
          {
            id: 'event-log-table-silo-col',
            label: 'Silo',
            valueKey: 'asset.silo.name',
            numeric: true,
            disablePadding: false,
            imageGetter: siloImageGetter,
            internalLinkGetter: internalLinkGetter,
            valueFormatter: (str: string, row: any) => (row.silo.name),
          },
          {
            id: 'event-log-table-event-network-col',
            label: 'Network',
            valueKey: 'network',
            numeric: true,
            disablePadding: false,
            imageGetter: networkImageGetter,
            valueFormatter: (str: string) => str ? `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}` : ``
          },
          {
            id: 'event-log-table-event-deployment-col',
            label: 'Deployment',
            valueKey: 'deployment_id',
            numeric: false,
            disablePadding: false,
            imageGetter: (str: string, row: any) => deploymentImageGetter(row.deployment_id),
            valueFormatter: (str: string, row: any) => `${DEPLOYMENT_ID_TO_HUMAN_READABLE[row.deployment_id]}`
          },
          {
            id: 'event-log-table-event-relative-time-col',
            label: 'Relative Time',
            valueKey: 'block_timestamp',
            numeric: false,
            disablePadding: false,
            valueFormatter: (str: Date) => (`${dayjs(str).fromNow()}`),
          },
          {
            id: 'event-log-table-event-time-col',
            label: 'Event Time',
            valueKey: 'block_timestamp_unix',
            numeric: true,
            disablePadding: false,
            valueFormatter: (str: number) => (`${formatDate(new Date(str * 1000))}`),
          },
          {
            id: 'event-log-table-event-tx-hash-col',
            label: 'Transaction Hash',
            valueKey: 'tx_hash',
            numeric: false,
            disablePadding: false,
            valueFormatter: (str: string) => (centerShortenLongString(str, 16)),
            externalLinkGetter: (str: string, row: any) => (getEtherscanLink(row.network, str, "transaction")),
          },
        ]}
      />
      }
    </>
  );
}