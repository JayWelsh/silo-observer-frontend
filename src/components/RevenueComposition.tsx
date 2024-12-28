import React, { useEffect, useState } from 'react';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Grid';

import BigNumber from 'bignumber.js';

import { 
  API_ENDPOINT,
  DEPLOYMENT_ID_TO_HUMAN_READABLE,
  NETWORK_TO_HUMAN_READABLE,
  CHAIN_ID_TO_PIE_COLOR,
} from '../constants';

import { 
  IPieData,
  // IStackedTimeseries,
} from '../interfaces';

import { PropsFromRedux } from '../containers/SiloTotalAssetCompositionContainer';
import PieChartContainer from '../containers/PieChartContainer';
import NetworkSelectionListContainer from '../containers/NetworkSelectionListContainer';
import BasicAreaChartContainer from '../containers/BasicAreaChartContainer';
// import StackedAreaChartContainer from '../containers/StackedAreaChartContainer';

import { priceFormat } from '../utils';

BigNumber.config({ EXPONENTIAL_AT: 1e+9 });

interface ITimeseries {
  date: string;
  value: number;
}

interface IDataResponse {
  amount_pending: string;
  amount_pending_usd: string;
  amount_harvested: string;
  amount_harvested_usd: string;
  timestamp: string
  silo_address: string
  asset_address: string
  network: string
  deployment_id: string
  asset_symbol?: string
  silo_name?: string;
  markForRemoval?: boolean;
}

interface INetworkGroupedData {
  [key: string]: {
    pieData: IPieData[];
    otherRecord: IPieData;
    totalAmountPendingUSD: string;
  }
}

const revenueValueFormat = (pieChartRecord: IPieData) => {
  return `${pieChartRecord.name}`
} 

const tooltipValueFormat = (pieChartRecord: IPieData) => {
  if(pieChartRecord.tooltipText) {
    return pieChartRecord.tooltipText;
  }
  return `${pieChartRecord.name}: ${priceFormat(pieChartRecord.value, 2, "$")}`
}

const tooltipValueFormatGrouped = (pieChartRecord: IPieData) => {
  return `${pieChartRecord.name}: ${priceFormat(pieChartRecord.value, 2, "$")}`
}

export default function SiloTotalAssetComposition(props: PropsFromRedux) {

  let {
    selectedNetworkIDs,
    isConsideredMobile,
  } = props;

  const [pieData, setPieData] = useState<IPieData[]>([]);
  const [timeseriesDataDistinctTimestamps, setTimeseriesDataDistinctTimestamps] = useState<ITimeseries[]>([]);
  // const [timeseriesDataStackedNetworksDistinctTimestamps, setTimeseriesDataStackedNetworksDistinctTimestamps] = useState<IStackedTimeseries[]>([]);
  const [networkOverviewGroupedData, setNetworkOverviewGroupedData] = useState<IPieData[]>([]);
  const [networkGroupedData, setNetworkGroupedData] = useState<INetworkGroupedData>({});
  const [totalAmountPendingUSD, setTotalAmountPendingUSD] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [excludeTokenSymbols, setExcludeTokenSymbols] = useState<string[]>(["XAI"]);

  const toggleExcludedSymbol = (symbol: string) => {
    const index = excludeTokenSymbols.indexOf(symbol);
    if (index > -1) {
      setExcludeTokenSymbols([...excludeTokenSymbols.slice(0, index), ...excludeTokenSymbols.slice(index + 1)]);
    } else {
      setExcludeTokenSymbols([...excludeTokenSymbols, symbol]);
    }
  }

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch(`${API_ENDPOINT}/silo-revenue-snapshots/latest?networks=${selectedNetworkIDs.join(',')}&perPage=1000`).then(resp => resp.json()),
      fetch(`${API_ENDPOINT}/silo-revenue-snapshots/timeseries-distinct-timestamps?networks=${selectedNetworkIDs.join(',')}&perPage=1000&excludeXAI=${excludeTokenSymbols.indexOf("XAI") > -1 ? "true" : "false"}`).then(resp => resp.json()),
      // fetch(`${API_ENDPOINT}/silo-revenue-snapshots/timeseries-distinct-networks?networks=${selectedNetworkIDs.join(',')}&perPage=1000&excludeXAI=${excludeTokenSymbols.indexOf("XAI") > -1 ? "true" : "false"}`).then(resp => resp.json()),
    ]).then((data) => {

      let pieDataResponse : IDataResponse[] = data[0].data;
      let timeseriesDataResponseDistinctTimestamps = data[1].data;
      // let timeseriesDataResponseDistinctNetworks = data[2].data;

      console.log({
        timeseriesDataResponseDistinctTimestamps,
        // timeseriesDataResponseDistinctNetworks
      })

      const revenueTimeseriesData : ITimeseries[] = [];

      for(let timeseriesEntry of timeseriesDataResponseDistinctTimestamps) {
        revenueTimeseriesData.push({
          date: timeseriesEntry.timestamp,
          value: timeseriesEntry.amount_pending_usd,
        })
      }

      // const timestampToNetworkTimeseriesData : {[key: string]: {[key: string]: number}} = {};
      // const networkTimeseriesStackedData : IStackedTimeseries[] = [];

      // for(let timeseriesNetworkEntry of timeseriesDataResponseDistinctNetworks) {
      //   if(timestampToNetworkTimeseriesData[timeseriesNetworkEntry.timestamp]) {
      //     if(!timestampToNetworkTimeseriesData[timeseriesNetworkEntry.timestamp][timeseriesNetworkEntry.network]) {
      //       timestampToNetworkTimeseriesData[timeseriesNetworkEntry.timestamp][timeseriesNetworkEntry.network] = Number(Number(timeseriesNetworkEntry.amount_pending_usd).toFixed(2));
      //     }
      //   } else {
      //     timestampToNetworkTimeseriesData[timeseriesNetworkEntry.timestamp] = {};
      //     if(!timestampToNetworkTimeseriesData[timeseriesNetworkEntry.timestamp][timeseriesNetworkEntry.network]) {
      //       timestampToNetworkTimeseriesData[timeseriesNetworkEntry.timestamp][timeseriesNetworkEntry.network] = Number(Number(timeseriesNetworkEntry.amount_pending_usd).toFixed(2));
      //     }
      //   }
      // }

      // console.log({timestampToNetworkTimeseriesData})

      // for(let [timestamp, networkValues] of Object.entries(timestampToNetworkTimeseriesData)) {
      //   console.log({timestamp, networkValues});
      //   networkTimeseriesStackedData.push({
      //     date: timestamp,
      //     ...networkValues
      //   })
      // }

      const groupedByNetwork: INetworkGroupedData = {};

      for(let network of selectedNetworkIDs) {
        groupedByNetwork[network] = {
          pieData: [],
          otherRecord: {
            name: "Other Assets",
            groupedDataTooltipTitle: "Other Assets",
            value: 0,
            labelFormatFn: revenueValueFormat,
            tooltipFormatFn: tooltipValueFormat,
            groupedTooltipFontSize: '11px',
            groupedData: [],
          },
          totalAmountPendingUSD: new BigNumber("0").toString(),
        };
      };

      let localTotalAmountPendingUSD = pieDataResponse.reduce((acc: string, entry: IDataResponse) => {
        if(entry.asset_symbol && excludeTokenSymbols.indexOf(entry.asset_symbol.toUpperCase()) > -1) {
          return new BigNumber(acc).toString();
        }
        return new BigNumber(entry.amount_pending_usd).plus(new BigNumber(acc)).toString();
      }, "0");

      // let runningTotal = 0;
      let otherRecord : IPieData = {
        name: "Other Assets",
        groupedDataTooltipTitle: "Other Assets",
        value: 0,
        labelFormatFn: revenueValueFormat,
        tooltipFormatFn: tooltipValueFormat,
        groupedTooltipFontSize: '11px',
        groupedData: [],
      };

      let formattedPieData : IPieData[] = pieDataResponse.sort((a, b) => Number(b.amount_pending_usd) - Number(a.amount_pending_usd)).map((entry) => {
        let markForRemoval = false;
        let amountPendingUSD = Number(Number(entry.amount_pending_usd).toFixed(2));
        // runningTotal += percentageOfWhole;
        if(entry.asset_symbol && (excludeTokenSymbols.indexOf(entry.asset_symbol.toUpperCase()) > -1)) {
          markForRemoval = true;
        }
        if(amountPendingUSD < 1000) {
          if(entry.asset_symbol && (excludeTokenSymbols.indexOf(entry.asset_symbol.toUpperCase()) === -1)) {
            otherRecord.value += amountPendingUSD;
            otherRecord.groupedDataTooltipTitle = `Other Assets (${priceFormat(otherRecord.value, 2, "$")} total)`
            if(otherRecord.groupedData) {
              if(amountPendingUSD > 50) {
                let groupedDataEntry = {
                  name: `${entry.silo_name}-${entry.asset_symbol}`,
                  value: amountPendingUSD,
                  labelFormatFn: revenueValueFormat,
                  tooltipFormatFn: tooltipValueFormatGrouped,
                };
                otherRecord.groupedData.push(groupedDataEntry)
                if(entry.network && groupedByNetwork[entry.network] && groupedByNetwork[entry.network].otherRecord && groupedByNetwork[entry.network].otherRecord.groupedData) {
                  //@ts-ignore
                  groupedByNetwork[entry.network].otherRecord.groupedData.push(groupedDataEntry);
                  groupedByNetwork[entry.network].otherRecord.value = Number(new BigNumber(groupedByNetwork[entry.network].otherRecord.value).plus(new BigNumber(amountPendingUSD)).toNumber().toFixed(2));
                  groupedByNetwork[entry.network].otherRecord.groupedDataTooltipTitle = `Other Assets (${priceFormat(groupedByNetwork[entry.network].otherRecord.value, 2, "$")} total)`
                } else {
                  groupedByNetwork[entry.network].otherRecord.value = Number(new BigNumber(amountPendingUSD).toNumber().toFixed(2));
                  groupedByNetwork[entry.network].otherRecord.groupedData = [groupedDataEntry];
                  groupedByNetwork[entry.network].otherRecord.groupedDataTooltipTitle = `Other Assets (${priceFormat(groupedByNetwork[entry.network].otherRecord.value, 2, "$")} total)`
                }
              }
            }
          }
          markForRemoval = true;
        }
        let pieDataEntry = {
          name: `${entry.silo_name}-${entry.asset_symbol} (${priceFormat(entry.amount_pending_usd, 2, "$")})`,
          tooltipText: `${priceFormat(entry.amount_pending_usd, 2, "$")} of ${entry.asset_symbol} unclaimed on ${entry.silo_name} silo (${NETWORK_TO_HUMAN_READABLE[entry.network]} ${DEPLOYMENT_ID_TO_HUMAN_READABLE[entry.deployment_id]})`,
          value: amountPendingUSD,
          markForRemoval,
          labelFormatFn: revenueValueFormat,
          tooltipFormatFn: tooltipValueFormat,
        };
        if(entry.network) {
          if(entry.asset_symbol && (excludeTokenSymbols.indexOf(entry.asset_symbol.toUpperCase()) === -1)) {
            groupedByNetwork[entry.network].totalAmountPendingUSD = new BigNumber(groupedByNetwork[entry.network].totalAmountPendingUSD).plus(new BigNumber(entry.amount_pending_usd)).toString();
            if(!markForRemoval) {
              groupedByNetwork[entry.network].pieData.push(pieDataEntry);
            }
          }
        }
        return pieDataEntry;
      }).filter((entry) => !entry.markForRemoval);

      if(otherRecord.value > 0) {
        formattedPieData.push(otherRecord);
      }

      console.log({formattedPieData})

      console.log({groupedByNetwork});

      let tempNetworkOverviewGroupedData : IPieData[] = [];
      for(let network of selectedNetworkIDs) {
        if(groupedByNetwork[network].otherRecord.value > 0) {
          groupedByNetwork[network].pieData.push(groupedByNetwork[network].otherRecord);
        }
        let networkPieDataEntry = {
          name: `${NETWORK_TO_HUMAN_READABLE[network]} (${priceFormat(groupedByNetwork[network].totalAmountPendingUSD, 2, "$")})`,
          tooltipText: `${priceFormat(groupedByNetwork[network].totalAmountPendingUSD, 2, "$")} of combined fee tokens unclaimed on ${NETWORK_TO_HUMAN_READABLE[network]}`,
          value: Number(groupedByNetwork[network].totalAmountPendingUSD),
          labelFormatFn: revenueValueFormat,
          tooltipFormatFn: tooltipValueFormat,
          fill: CHAIN_ID_TO_PIE_COLOR[network],
        };
        tempNetworkOverviewGroupedData.push(networkPieDataEntry);
      };

      setNetworkOverviewGroupedData(tempNetworkOverviewGroupedData);

      setNetworkGroupedData(groupedByNetwork);

      setIsLoading(false);

      setPieData(formattedPieData);

      setTotalAmountPendingUSD(localTotalAmountPendingUSD);

      setTimeseriesDataDistinctTimestamps(revenueTimeseriesData.reverse());

      // setTimeseriesDataStackedNetworksDistinctTimestamps(networkTimeseriesStackedData.reverse());

    })
  }, [selectedNetworkIDs, excludeTokenSymbols])

  return (
    <>
      <FormGroup style={{marginBottom: 16}}>
        <FormControlLabel control={<Switch color="secondary" defaultChecked checked={excludeTokenSymbols.indexOf("XAI") > -1} onChange={() => toggleExcludedSymbol("XAI")} />} label="Exclude XAI fees" />
      </FormGroup>
      <Card style={{paddingLeft: 24, paddingRight: 24, paddingTop: 24, paddingBottom: 24, marginBottom: 24, display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center'}}>
        <Typography variant={isConsideredMobile ? "h4" : "h3"} style={{marginBottom: 8, marginTop: 0}}>
          {totalAmountPendingUSD ? priceFormat(totalAmountPendingUSD, 2, "$") : "Loading..."}
        </Typography>
        <Typography className="secondary-text" variant="subtitle1" style={{fontWeight: 300, marginBottom: 8}}>Estimated Unclaimed Fees Across All Silos</Typography>
        <NetworkSelectionListContainer networkViewListOnly={true} />
      </Card>
      <Grid container spacing={3}>
        {/* <Grid item xs={12} md={12}>
          <StackedAreaChartContainer
            chartData={timeseriesDataStackedNetworksDistinctTimestamps}
            seriesKeys={Object.keys(CHAIN_ID_TO_PIE_COLOR)}
            loading={isLoading}
            colors={CHAIN_ID_TO_PIE_COLOR}
            height={500}
            rightTextFormatValueFn={(value: any) => priceFormat(value, 2, '$')}
            formatValueFn={(value: any) => priceFormat(value, 2, "$")}
            leftTextTitle={`All Silos`}
            leftTextSubtitle={`Stacked Unclaimed Fee Tokens (Approx. USD)`}
            showChange={true}
            changeType="up-good"
          />
        </Grid> */}
        <Grid item xs={12} md={12}>
          {timeseriesDataDistinctTimestamps &&
            <BasicAreaChartContainer
              chartData={timeseriesDataDistinctTimestamps}
              loading={isLoading}
              leftTextTitle={`All Silos`}
              leftTextSubtitle={`Unclaimed Fee Tokens (Approx. USD)`}
              rightTextFormatValueFn={(value: any) => priceFormat(value, 2, '$')}
              showChange={true}
              changeType={"up-good"}
              height={400}
              formatValueFn={(value: any) => priceFormat(value, 2, "$")}
            />
          }
        </Grid>
        <Grid item xs={12} md={12}>
          <Card style={{paddingLeft: 16, paddingRight: 16, paddingTop: 16, overflow: 'visible'}}>
            <PieChartContainer 
              data={pieData}
              labelFontSize={"0.8rem"}
              loading={isLoading}
              title={"Current Total Unclaimed Silo Fees"}
              desktopHeight={800}
              mobileHeight={800}
            />
          </Card>
        </Grid>
        <Grid item xs={12} md={12}>
          <Card style={{paddingLeft: 16, paddingRight: 16, paddingTop: 16, overflow: 'visible'}}>
            <PieChartContainer 
              data={networkOverviewGroupedData}
              labelFontSize={"0.8rem"}
              loading={isLoading}
              title={"Current Total Unclaimed Silo Fees By Network"}
              desktopHeight={400}
              mobileHeight={400}
            />
          </Card>
        </Grid>
        {Object.entries(networkGroupedData).sort(([networkA, dataA], [networkB, dataB]) => Number(dataB.totalAmountPendingUSD) - Number(dataA.totalAmountPendingUSD)).map(([network, data]) => (
          <Grid item xs={12} md={12}  key={`network-breakdown-${network}`}>
            <Card style={{paddingLeft: 16, paddingRight: 16, paddingTop: 16, overflow: 'visible'}}>
              <PieChartContainer 
                data={data.pieData}
                labelFontSize={"0.8rem"}
                loading={isLoading}
                title={`${NETWORK_TO_HUMAN_READABLE[network]} Network Current Total Unclaimed Silo Fees`}
                desktopHeight={400}
                mobileHeight={400}
              />
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}