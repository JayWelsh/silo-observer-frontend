import React, { useEffect, useState } from 'react';

import { styled } from '@mui/material/styles';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import DepositIcon from '@mui/icons-material/MoveToInbox';
import WithdrawIcon from '@mui/icons-material/Outbox';
import BorrowIcon from '@mui/icons-material/AccountBalance';
import RepaidIcon from '@mui/icons-material/CreditScore';

import { API_ENDPOINT } from '../constants';

import LoadingIconPlain from './LoadingIconPlain';

import { PropsFromRedux } from '../containers/DailyStatsContainer';

import LinkWrapper from './LinkWrapper';

import {
  priceFormat
} from '../utils';

const Container = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4),
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
  padding: theme.spacing(4),
  textAlign: 'center',
  position: 'relative',
}));

interface IStatEntry {
  title: string
  subtitle?: string
  value: string
  icon?: JSX.Element
  route?: string
  formatter?: (arg: string) => string
}

export default function DailyStats(props: PropsFromRedux) {

  const placeholderCollection = Array.from({length: 4}).map(() => { return { title: "Loading", value: "Loading", icon: <LoadingIconPlain relative={true} iconHeight={48} height={54} /> } });

  const [statCollection, setStatCollection] = useState<IStatEntry[]>(placeholderCollection);
  // const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // setIsLoading(true);
    Promise.all([
      fetch(`${API_ENDPOINT}/volume/deposit?period=today`).then(resp => resp.json()),
      fetch(`${API_ENDPOINT}/volume/withdraw?period=today`).then(resp => resp.json()),
      fetch(`${API_ENDPOINT}/volume/borrow?period=today`).then(resp => resp.json()),
      fetch(`${API_ENDPOINT}/volume/repay?period=today`).then(resp => resp.json()),
    ]).then((data) => {
    
      let [
        dailyDepositUSDResponse,
        dailyWithdrawUSDResponse,
        dailyBorrowUSDResponse,
        dailyRepayUSDResponse,
      ] = data;

      let dailyDepositUSDRecord = dailyDepositUSDResponse.data[0];
      let dailyWithdrawUSDRecord = dailyWithdrawUSDResponse.data[0];
      let dailyBorrowUSDRecord = dailyBorrowUSDResponse.data[0];
      let dailyRepayUSDRecord = dailyRepayUSDResponse.data[0];

      let newStatCollection : IStatEntry[] = [];

      let depositEntry = {
        title: "Deposited",
        icon: <DepositIcon style={{fontSize: '3rem'}}/>,
        value: dailyDepositUSDRecord?.usd ? dailyDepositUSDRecord.usd : 0,
        formatter: (value: string) => { return priceFormat(value, 2, "$", true) },
        route: "/volume/deposit",
      }

      newStatCollection.push(depositEntry);

      let withdrawEntry = {
        title: "Withdrawn",
        icon: <WithdrawIcon style={{fontSize: '3rem'}}/>,
        value: dailyWithdrawUSDRecord?.usd ? dailyWithdrawUSDRecord.usd : 0,
        formatter: (value: string) => { return priceFormat(value, 2, "$", true) },
        route: "/volume/withdraw",
      }

      newStatCollection.push(withdrawEntry);

      let borrowEntry = {
        title: "Borrowed",
        icon: <BorrowIcon style={{fontSize: '3rem'}}/>,
        value: dailyBorrowUSDRecord?.usd ? dailyBorrowUSDRecord.usd : 0,
        formatter: (value: string) => { return priceFormat(value, 2, "$", true) },
        route: "/volume/borrow",
      }

      newStatCollection.push(borrowEntry);

      let repayEntry = {
        title: "Repaid",
        icon: <RepaidIcon style={{fontSize: '3rem'}}/>,
        value: dailyRepayUSDRecord?.usd ? dailyRepayUSDRecord.usd : 0,
        formatter: (value: string) => { return priceFormat(value, 2, "$", true) },
        route: "/volume/repay",
      }

      newStatCollection.push(repayEntry);

      setStatCollection(newStatCollection);
      
      // setIsLoading(false);
    })
  }, [])

  return (
    <Container>
      <Typography variant="h4" style={{marginBottom: 0}}>
        Today's Activity
      </Typography>
      <Typography className="secondary-text" variant="subtitle1" style={{marginBottom: 24, fontWeight: 300}}>UTC Timezone</Typography>
      <StatContainer>
        <StatGrid container spacing={2}>
            {statCollection.map(({title, subtitle, value, formatter, icon, route}, statIndex) => 
              <Grid key={`stat-collection-entry-${statIndex}`} item xs={12} md={6}>
                <LinkWrapper link={route}>
                  <StatEntryContainer className="secondary-card">
                    {icon &&
                      <div style={{marginBottom: 8}}>
                        {icon}
                      </div>
                    }
                    <Typography variant="h4" style={{marginBottom: subtitle ? 0 : 16, fontSize: '1.8rem'}}>
                      {title}
                    </Typography>
                    {subtitle && <Typography variant="subtitle1"  style={{marginBottom: 8}}>{subtitle}</Typography>}
                    <Typography variant="h6" style={{fontWeight: 'bold'}}>{formatter ? formatter(value) : value}</Typography>
                  </StatEntryContainer>
                </LinkWrapper>
              </Grid>
            )}
        </StatGrid>
      </StatContainer>
    </Container>
  );
}