import React, { useEffect, useState } from 'react';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

import BigNumber from 'bignumber.js';

import { 
  API_ENDPOINT,
  DEPLOYMENT_ID_TO_HUMAN_READABLE,
  NETWORK_TO_HUMAN_READABLE,
} from '../constants';

import { IPieData } from '../interfaces';

import { PropsFromRedux } from '../containers/SiloTotalAssetCompositionContainer';
import PieChartContainer from '../containers/PieChartContainer';
import NetworkSelectionListContainer from '../containers/NetworkSelectionListContainer';

import { priceFormat } from '../utils';

BigNumber.config({ EXPONENTIAL_AT: 1e+9 });

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
      fetch(`${API_ENDPOINT}/silo-revenue-snapshots/latest?networks=${selectedNetworkIDs.join(',')}`).then(resp => resp.json()),
    ]).then((data) => {

      let pieDataResponse : IDataResponse[] = data[0].data;

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
                otherRecord.groupedData.push({
                  name: `${entry.silo_name}-${entry.asset_symbol}`,
                  value: amountPendingUSD,
                  labelFormatFn: revenueValueFormat,
                  tooltipFormatFn: tooltipValueFormatGrouped,
                })
              }
            }
          }
          markForRemoval = true;
        }
        return {
          name: `${entry.silo_name}-${entry.asset_symbol} (${priceFormat(entry.amount_pending_usd, 2, "$")})`,
          tooltipText: `${priceFormat(entry.amount_pending_usd, 2, "$")} of ${entry.asset_symbol} unclaimed on ${entry.silo_name} silo (${NETWORK_TO_HUMAN_READABLE[entry.network]} ${DEPLOYMENT_ID_TO_HUMAN_READABLE[entry.deployment_id]})`,
          value: amountPendingUSD,
          markForRemoval,
          labelFormatFn: revenueValueFormat,
          tooltipFormatFn: tooltipValueFormat,
        }
      }).filter((entry) => !entry.markForRemoval);

      if(otherRecord.value > 0) {
        formattedPieData.push(otherRecord);
      }

      console.log({formattedPieData})

      setIsLoading(false);

      setPieData(formattedPieData);

      setTotalAmountPendingUSD(localTotalAmountPendingUSD);

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
      <Card style={{paddingLeft: 16, paddingRight: 16, paddingTop: 16}}>
        <PieChartContainer 
          data={pieData}
          labelFontSize={"0.8rem"}
          loading={isLoading}
          title={"Current Total Unclaimed Silo Fees"}
          desktopHeight={800}
          mobileHeight={800}
        />
      </Card>
    </>
  );
}