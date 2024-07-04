import React, { useEffect, useState } from 'react';

import { utcFormat } from 'd3-time-format';

import RewardIcon from '@mui/icons-material/Redeem';

import { IContractEvent } from '../interfaces';

import SortableTable from './SortableTable';

import { API_ENDPOINT } from '../constants';

import { PropsFromRedux } from '../containers/SiloOverviewTableContainer';

import { 
  priceFormat,
  formatTokenAmount,
  centerShortenLongString,
  getEtherscanLink,
  formatTimeAgo,
  networkImageGetter,
  tokenImageGetter,
} from "../utils";

const formatDate = utcFormat("%b-%d-%Y %I:%M %p (UTC)");

interface IEventLogTable {
  eventType?: string
}

const iconGetter = (eventType: string, row: any) => {
  let fontSize = "1.5rem";
  let marginRight = 8;
  return <RewardIcon style={{fontSize, marginRight}}/>
}

export default function SiloOverviewTable(props: PropsFromRedux & IEventLogTable) {
  const [eventTableData, setEventTableData] = useState<IContractEvent[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [clientPage, setClientPage] = useState(0);
  const [serverPage, setServerPage] = useState(0);
  const [serverPerPage] = useState(50);
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
      fetch(`${API_ENDPOINT}/events/reward?page=${serverPage + 1}&perPage=${serverPerPage}&networks=${selectedNetworkIDs.join(',')}`).then(resp => resp.json()),
    ];
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
        tableHeading={`Latest SiloIncentiveController Reward Claims`}
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
            valueFormatter: (str: string) => `Reward Claimed`,
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
            id: 'event-log-table-event-network-col',
            label: 'Network',
            valueKey: 'network',
            numeric: true,
            disablePadding: false,
            imageGetter: networkImageGetter,
            valueFormatter: (str: string) => str ? `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}` : ``
          },
          {
            id: 'event-log-table-event-relative-time-col',
            label: 'Relative Time',
            valueKey: 'block_timestamp',
            numeric: false,
            disablePadding: false,
            valueFormatter: (str: Date, row: any) => (`${formatTimeAgo(row.block_timestamp_unix)}`),
          },
          {
            id: 'event-log-table-event-time-col',
            label: 'Event Time',
            valueKey: 'block_timestamp_unix',
            numeric: true,
            disablePadding: false,
            valueFormatter: (unixTimestamp: number) => (`${formatDate(new Date(unixTimestamp * 1000))}`),
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