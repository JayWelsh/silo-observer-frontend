import React, { useEffect, useState } from 'react';

import { styled } from '@mui/material/styles';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import DepositIcon from '@mui/icons-material/MoveToInbox';
import WithdrawIcon from '@mui/icons-material/Outbox';
import BorrowIcon from '@mui/icons-material/AccountBalance';
import RepaidIcon from '@mui/icons-material/CreditScore';
import LiquidateIcon from '@mui/icons-material/WaterDrop';
import UnclaimedFeesDeltaIcon from '@mui/icons-material/Savings';

import { IPieData, INetworkGroupedNumber, IGainAndLossGroupedNumber } from '../interfaces';

import { API_ENDPOINT } from '../constants';

import { PropsFromRedux } from '../containers/DailyStatsContainer';
import PieChartContainer from '../containers/PieChartContainer';

import LinkWrapper from './LinkWrapper';

import {
  priceFormat,
  convertNetworkDataToPieData,
  convertPieDataToPercentages,
  addFormattingFunctionsToPieData,
} from '../utils';

const Container = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  justifyContent: 'center',
  textAlign: 'center',
  flexDirection: 'column',
  backgroundColor: '#00000033',
  backgroundImage: 'none',
}));

const StatGrid = styled(Grid)(() => ({
  display: 'flex',
  justifyContent: 'center',
}));

const StatContainer = styled("div")(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
}));

const StatEntryContainer = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  position: 'relative',
  height: '100%',
}));

interface IStatEntry {
  title: string
  subtitle?: string
  value: string
  icon?: JSX.Element
  route?: string
  formatter?: (arg: string) => string
  pieData?: IPieData[]
}

const pieChartTooltipValueFormatDollars = (pieChartRecord: IPieData) => {
  return `${pieChartRecord.name}: ${priceFormat(pieChartRecord.value, 2, "$")}`
}

const pieChartLabelValueFormatDollars = (pieChartRecord: IPieData) => {
  return `${pieChartRecord.name} (${priceFormat(pieChartRecord.value, 2, "$")})`
}

export default function DailyStats(props: PropsFromRedux) {

  let {
    selectedNetworkIDs,
  } = props;

  const placeholderCollection = Array.from([
    <DepositIcon style={{fontSize: '3rem'}}/>,
    <WithdrawIcon style={{fontSize: '3rem'}}/>,
    <BorrowIcon style={{fontSize: '3rem'}}/>,
    <RepaidIcon style={{fontSize: '3rem'}}/>,
    <UnclaimedFeesDeltaIcon style={{fontSize: '3rem'}}/>,
    <LiquidateIcon style={{fontSize: '3rem'}}/>,
  ]).map((icon) => { return { title: "Loading", value: "Loading", icon} });

  const [statCollection, setStatCollection] = useState<IStatEntry[]>(placeholderCollection);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch(`${API_ENDPOINT}/volume/deposit?period=today&networks=${selectedNetworkIDs.join(',')}&groupBy=network`).then(resp => resp.json()),
      fetch(`${API_ENDPOINT}/volume/withdraw?period=today&networks=${selectedNetworkIDs.join(',')}&groupBy=network`).then(resp => resp.json()),
      fetch(`${API_ENDPOINT}/volume/borrow?period=today&networks=${selectedNetworkIDs.join(',')}&groupBy=network`).then(resp => resp.json()),
      fetch(`${API_ENDPOINT}/volume/repay?period=today&networks=${selectedNetworkIDs.join(',')}&groupBy=network`).then(resp => resp.json()),
      fetch(`${API_ENDPOINT}/volume/liquidation?period=today&networks=${selectedNetworkIDs.join(',')}&groupBy=network`).then(resp => resp.json()),
      fetch(`${API_ENDPOINT}/silo-revenue-snapshots/daily-unclaimed-fee-delta?networks=${selectedNetworkIDs.join(',')}`).then(resp => resp.json()),
    ]).then((data) => {
    
      let [
        dailyDepositUSDResponse,
        dailyWithdrawUSDResponse,
        dailyBorrowUSDResponse,
        dailyRepayUSDResponse,
        dailyLiquidateUSDResponse,
        dailyUnclaimedFeeDeltaUSDResponse,
      ] = data;

      let dailyDepositUSDRecordGroupedByNetwork : INetworkGroupedNumber = {};
      let dailyWithdrawUSDRecordGroupedByNetwork : INetworkGroupedNumber = {};
      let dailyBorrowUSDRecordGroupedByNetwork : INetworkGroupedNumber = {};
      let dailyRepayUSDRecordGroupedByNetwork : INetworkGroupedNumber = {};
      let dailyLiquidatedUSDRecordGroupedByNetwork : INetworkGroupedNumber = {};
      let dailyUnclaimedFeeDeltaUSDRecordGroupedByNetwork : INetworkGroupedNumber = {};
      let dailyUnclaimedFeeDeltaUSDRecordGroupedByGainAndLoss : IGainAndLossGroupedNumber = {};

      let dailyDepositUSDRecord = { usd: 0 };
      let dailyWithdrawUSDRecord = { usd: 0 };
      let dailyBorrowUSDRecord = { usd: 0 };
      let dailyRepayUSDRecord = { usd: 0 };
      let dailyLiquidatedUSDRecord = { usd: 0 };
      let dailyUnclaimedFeeDeltaUSDRecord = { usd: 0 };

      for (let entry of dailyDepositUSDResponse.data) {
        const usd = Number(entry.usd);
        const network = entry.network;
        if(!isNaN(usd) && (usd > 0)) {
          dailyDepositUSDRecord.usd = dailyDepositUSDRecord.usd + usd;
        }
        if (network && !isNaN(usd) && (usd > 0)) {
            if (dailyDepositUSDRecordGroupedByNetwork[network] === undefined) {
                dailyDepositUSDRecordGroupedByNetwork[network] = usd;
            } else {
                dailyDepositUSDRecordGroupedByNetwork[network] += usd;
            }
        }
      }

      // Deposits
      for (let entry of dailyDepositUSDResponse.data) {
          const usd = Number(entry.usd);
          const network = entry.network;
          if(!isNaN(usd) && (usd > 0)) {
              dailyDepositUSDRecord.usd = dailyDepositUSDRecord.usd + usd;
          }
          if (network && !isNaN(usd) && (usd > 0)) {
              if (dailyDepositUSDRecordGroupedByNetwork[network] === undefined) {
                  dailyDepositUSDRecordGroupedByNetwork[network] = usd;
              } else {
                  dailyDepositUSDRecordGroupedByNetwork[network] += usd;
              }
          }
      }

      // Withdrawals
      for (let entry of dailyWithdrawUSDResponse.data) {
          const usd = Number(entry.usd);
          const network = entry.network;
          if(!isNaN(usd) && (usd > 0)) {
              dailyWithdrawUSDRecord.usd = dailyWithdrawUSDRecord.usd + usd;
          }
          if (network && !isNaN(usd) && (usd > 0)) {
              if (dailyWithdrawUSDRecordGroupedByNetwork[network] === undefined) {
                  dailyWithdrawUSDRecordGroupedByNetwork[network] = usd;
              } else {
                  dailyWithdrawUSDRecordGroupedByNetwork[network] += usd;
              }
          }
      }

      // Borrows
      for (let entry of dailyBorrowUSDResponse.data) {
          const usd = Number(entry.usd);
          const network = entry.network;
          if(!isNaN(usd) && (usd > 0)) {
              dailyBorrowUSDRecord.usd = dailyBorrowUSDRecord.usd + usd;
          }
          if (network && !isNaN(usd) && (usd > 0)) {
              if (dailyBorrowUSDRecordGroupedByNetwork[network] === undefined) {
                  dailyBorrowUSDRecordGroupedByNetwork[network] = usd;
              } else {
                  dailyBorrowUSDRecordGroupedByNetwork[network] += usd;
              }
          }
      }

      // Repays
      for (let entry of dailyRepayUSDResponse.data) {
          const usd = Number(entry.usd);
          const network = entry.network;
          if(!isNaN(usd) && (usd > 0)) {
              dailyRepayUSDRecord.usd = dailyRepayUSDRecord.usd + usd;
          }
          if (network && !isNaN(usd) && (usd > 0)) {
              if (dailyRepayUSDRecordGroupedByNetwork[network] === undefined) {
                  dailyRepayUSDRecordGroupedByNetwork[network] = usd;
              } else {
                  dailyRepayUSDRecordGroupedByNetwork[network] += usd;
              }
          }
      }

      // Liquidations
      for (let entry of dailyLiquidateUSDResponse.data) {
          const usd = Number(entry.usd);
          const network = entry.network;
          if(!isNaN(usd) && (usd > 0)) {
              dailyLiquidatedUSDRecord.usd = dailyLiquidatedUSDRecord.usd + usd;
          }
          if (network && !isNaN(usd) && (usd > 0)) {
              if (dailyLiquidatedUSDRecordGroupedByNetwork[network] === undefined) {
                  dailyLiquidatedUSDRecordGroupedByNetwork[network] = usd;
              } else {
                  dailyLiquidatedUSDRecordGroupedByNetwork[network] += usd;
              }
          }
      }

      // Unclaimed Fees Delta USD
      for (let entry of dailyUnclaimedFeeDeltaUSDResponse.data) {
        const usd = Number(Number(entry.pending_usd_delta).toFixed(2));
        const network = entry.network;
        if(!isNaN(usd)) {
          dailyUnclaimedFeeDeltaUSDRecord.usd = Number(Number(dailyUnclaimedFeeDeltaUSDRecord.usd + usd).toFixed(2));
        }
        if (network && !isNaN(usd)) {
          if(Math.abs(usd) > 0) {
            if(!dailyUnclaimedFeeDeltaUSDRecordGroupedByGainAndLoss[usd < 0 ? "loss" : "gain"]) {
              dailyUnclaimedFeeDeltaUSDRecordGroupedByGainAndLoss[usd < 0 ? "loss" : "gain"] = 0;
            }
            dailyUnclaimedFeeDeltaUSDRecordGroupedByGainAndLoss[usd < 0 ? "loss" : "gain"] = Number(Number(dailyUnclaimedFeeDeltaUSDRecordGroupedByGainAndLoss[usd < 0 ? "loss" : "gain"] + Math.abs(usd)).toFixed(2));
          }
          if(usd > 0) {
            if (dailyUnclaimedFeeDeltaUSDRecordGroupedByNetwork[network] === undefined) {
              dailyUnclaimedFeeDeltaUSDRecordGroupedByNetwork[network] = usd;
            } else {
              dailyUnclaimedFeeDeltaUSDRecordGroupedByNetwork[network] += usd;
            }
          }
        }
      }

      const pieDataCollections = convertNetworkDataToPieData({
          deposit: dailyDepositUSDRecordGroupedByNetwork,
          withdraw: dailyWithdrawUSDRecordGroupedByNetwork,
          borrow: dailyBorrowUSDRecordGroupedByNetwork,
          repay: dailyRepayUSDRecordGroupedByNetwork,
          liquidated: dailyLiquidatedUSDRecordGroupedByNetwork,
          unclaimedFeeDelta: dailyUnclaimedFeeDeltaUSDRecordGroupedByGainAndLoss,
      });

      let newStatCollection : IStatEntry[] = [];

      let depositEntry = {
        title: "Deposited",
        icon: <DepositIcon style={{fontSize: '3rem'}}/>,
        value: dailyDepositUSDRecord?.usd ? dailyDepositUSDRecord.usd.toString() : "0",
        formatter: (value: string) => { return priceFormat(value, 2, "$", true) },
        route: "/volume/deposit",
        pieData: convertPieDataToPercentages(pieDataCollections.deposit),
      }

      newStatCollection.push(depositEntry);

      let withdrawEntry = {
        title: "Withdrawn",
        icon: <WithdrawIcon style={{fontSize: '3rem'}}/>,
        value: dailyWithdrawUSDRecord?.usd ? dailyWithdrawUSDRecord.usd.toString() : "0",
        formatter: (value: string) => { return priceFormat(value, 2, "$", true) },
        route: "/volume/withdraw",
        pieData: convertPieDataToPercentages(pieDataCollections.withdraw),
      }

      newStatCollection.push(withdrawEntry);

      let borrowEntry = {
        title: "Borrowed",
        icon: <BorrowIcon style={{fontSize: '3rem'}}/>,
        value: dailyBorrowUSDRecord?.usd ? dailyBorrowUSDRecord.usd.toString() : "0",
        formatter: (value: string) => { return priceFormat(value, 2, "$", true) },
        route: "/volume/borrow",
        pieData: convertPieDataToPercentages(pieDataCollections.borrow),
      }

      newStatCollection.push(borrowEntry);

      let repayEntry = {
        title: "Repaid",
        icon: <RepaidIcon style={{fontSize: '3rem'}}/>,
        value: dailyRepayUSDRecord?.usd ? dailyRepayUSDRecord.usd.toString() : "0",
        formatter: (value: string) => { return priceFormat(value, 2, "$", true) },
        route: "/volume/repay",
        pieData: convertPieDataToPercentages(pieDataCollections.repay),
      }

      newStatCollection.push(repayEntry);

      let unclaimedFeeDeltaUSDEntry = {
        title: "Unclaimed Fees Value Change",
        icon: <UnclaimedFeesDeltaIcon style={{fontSize: '3rem'}}/>,
        value: dailyUnclaimedFeeDeltaUSDRecord?.usd ? dailyUnclaimedFeeDeltaUSDRecord.usd.toString() : "0",
        formatter: (value: string) => {
          console.log({value})
           return priceFormat(value, 2, "$", true) },
        route: "/revenue",
        pieData: pieDataCollections.unclaimedFeeDelta?.length > 0 ? addFormattingFunctionsToPieData(pieDataCollections.unclaimedFeeDelta, pieChartLabelValueFormatDollars, pieChartTooltipValueFormatDollars) : [],
      }

      newStatCollection.push(unclaimedFeeDeltaUSDEntry);

      let liquidationEntry = {
        title: "Liquidated",
        icon: <LiquidateIcon style={{fontSize: '3rem'}}/>,
        value: dailyLiquidatedUSDRecord?.usd ? dailyLiquidatedUSDRecord.usd.toString() : "0",
        formatter: (value: string) => {
          console.log({value})
           return priceFormat(value, 2, "$", true) },
        route: "/volume/liquidation",
        pieData: pieDataCollections.liquidated?.length > 0 ? convertPieDataToPercentages(pieDataCollections.liquidated) : [],
      }

      newStatCollection.push(liquidationEntry);

      setStatCollection(newStatCollection);
      
      setIsLoading(false);
    })
  }, [selectedNetworkIDs])

  return (
    <Container>
      <Typography variant="h4" style={{marginBottom: 0}}>
        Today's Activity
      </Typography>
      <Typography className="secondary-text" variant="subtitle1" style={{marginBottom: 24, fontWeight: 300}}>UTC Timezone</Typography>
      <StatContainer>
        <StatGrid container spacing={2}>
            {statCollection.map(({title, subtitle, value, formatter, icon, route, pieData}, statIndex) => 
              <Grid key={`stat-collection-entry-${statIndex}`} item xs={12} lg={((statCollection.length % 2 === 1) && (statIndex === (statCollection.length - 1))) ? 12 : 4} md={((statCollection.length % 2 === 1) && (statIndex === (statCollection.length - 1))) ? 12 : 6}>
                <LinkWrapper link={route}>
                  <StatEntryContainer className="secondary-card">
                    {icon &&
                      <div style={{marginBottom: 8}}>
                        {icon}
                      </div>
                    }
                    <Typography variant="h4" style={{marginBottom: subtitle ? 0 : 16, fontSize: '1.4rem'}}>
                      {title}
                    </Typography>
                    {subtitle && <Typography variant="subtitle1"  style={{marginBottom: 4, fontSize: '1rem'}}>{subtitle}</Typography>}
                    <Typography variant="h6" style={{fontWeight: 'bold'}}>{formatter ? formatter(value) : value}</Typography>
                    <div onClick={(e) => {e.preventDefault();e.stopPropagation()}}>
                      <PieChartContainer 
                        disableLabels={true}
                        paddingBottom={0}
                        paddingTop={8}
                        desktopHeight={250}
                        mobileHeight={250}
                        data={pieData && pieData?.length > 0 ? pieData : isLoading ? [] : [{name: "N/A", value: 100, fill: "#4d4d4d"}]}
                        loading={isLoading}
                        labelFontSize={"0.8rem"}
                      />
                    </div>
                  </StatEntryContainer>
                </LinkWrapper>
              </Grid>
            )}
        </StatGrid>
      </StatContainer>
    </Container>
  );
}