import React, {useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom";

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import { API_ENDPOINT } from '../constants';

import BasicAreaChartContainer from '../containers/BasicAreaChartContainer';

interface IRateChartSelection {
  tokenSymbol: string;
  isConsideredMobile: boolean;
  overrideHandleSiloZoneChange?: (arg0: SelectChangeEvent<string>) => void;
}

interface ITokenRate {
    date: string;
    value: number;
}

interface ITokenRates {
    [key: string]: ITokenRate[]
}

interface ISymbolAddressMapping {
    [key: string]: string
}

interface IAddressBooleanMapping {
    [key: string]: boolean
}

interface IDateToRate {
  [key: string]: number
}

interface IAssetToDateToRate {
  [key: string]: IDateToRate
}

const RateChartSelection = (props: IRateChartSelection) => {

  const {
    tokenSymbol,
    isConsideredMobile,
    overrideHandleSiloZoneChange,
  } = props;

  let navigate = useNavigate();

  const [borrowerRates, setBorrowerRates] = useState<ITokenRates>({});
  const [lenderRates, setLenderRates] = useState<ITokenRates>({});
  const [tokenAddressToSymbolMapping, setTokenAddressToSymbolMapping] = useState<ISymbolAddressMapping>({});

  // keeping this for when I add a filter to hide 0 rate options
  // const [tokenAddressHasNonZeroRate, setTokenAddressHasNonZeroRate] = useState<IAddressBooleanMapping>({});

  const [siloInputTokenAddress, setSiloInputTokenAddress] = useState<string | undefined>();
  const [chartTypeSelection, setChartTypeSelection] = useState<string>('borrower');
  const [siloZoneSelection, setSiloZoneSelection] = useState<string>('rates');
  const [chartAssetSelection, setChartAssetSelection] = useState<string | undefined>();

  const handleChartTypeChange = (event: SelectChangeEvent) => {
    setChartTypeSelection(event.target.value as string);
  };

  const handleChartAssetChange = (event: SelectChangeEvent) => {
    setChartAssetSelection(event.target.value as string);
  };

  const handleSiloZoneChange = (event: SelectChangeEvent) => {
    let value = event.target.value as string;
    setSiloZoneSelection(value)
    if(value === 'tvl+borrowed') {
      navigate(`/silo/${tokenSymbol}/tvl`);
    }
  };

  useEffect(() => {
    setSiloInputTokenAddress(undefined);
    setBorrowerRates({});
    setLenderRates({});
    setTokenAddressToSymbolMapping({});
    Promise.all([
      fetch(`${API_ENDPOINT}/rates/silo/${tokenSymbol}?perPage=8640`).then(resp => resp.json()),
      fetch(`${API_ENDPOINT}/rates/silo/${tokenSymbol}?perPage=8640&resolution=hourly`).then(resp => resp.json()),
    ]).then((data) => {

      // Group rates by asset (e.g. BAL/XAI/WETH, but using the asset address) and by side (BORROWER/LENDER)

      let tokenAddressToSymbol : ISymbolAddressMapping = {};
      let tokenSymbolToAddress : ISymbolAddressMapping = {};

      let tokenRatesBorrower : ITokenRates = {};
      let tokenRatesLender : ITokenRates = {};

      let tokenAddressHasNonZeroData : IAddressBooleanMapping = {};

      let siloInputTokenAddressLocal : string | undefined;

      let siloRatesMinutely = data[0].data.reverse();
      let siloRatesHourly = data[1].data.reverse();

      let assetToDateToBorrowerRate : IAssetToDateToRate = {};
      let assetToDateToLenderRate : IAssetToDateToRate = {};

      for(let entry of siloRatesMinutely) {
        let tokenAddress = entry.asset.address;
        let tokenSymbol = entry.asset.symbol;

        if(!siloInputTokenAddressLocal) {
          siloInputTokenAddressLocal = entry.silo.input_token_address;
        }

        if(!tokenAddressToSymbol[tokenAddress]) {
            tokenAddressToSymbol[tokenAddress] = tokenSymbol
        }
        if(!tokenSymbolToAddress[tokenSymbol]) {
            tokenSymbolToAddress[tokenSymbol] = tokenAddress
        }
        
        if(!tokenRatesBorrower[tokenAddress]) {
            tokenRatesBorrower[tokenAddress] = [];
        }
        if(!tokenRatesLender[tokenAddress]) {
            tokenRatesLender[tokenAddress] = [];
        }

        if(!tokenAddressHasNonZeroData[tokenAddress]) {
            tokenAddressHasNonZeroData[tokenAddress] = false;
        }

        let value = Number(Number(entry.rate).toFixed(3));

        if(value > 0 && !tokenAddressHasNonZeroData[tokenAddress]) {
            tokenAddressHasNonZeroData[tokenAddress] = true;
        }

        if(entry.side === "BORROWER") {
            tokenRatesBorrower[tokenAddress].push({
                date: entry.timestamp,
                value,
            })
            if(!assetToDateToBorrowerRate[tokenAddress]) {
              assetToDateToBorrowerRate[tokenAddress] = {};
              assetToDateToBorrowerRate[tokenAddress][entry.timestamp] = value;
            } else if (!assetToDateToBorrowerRate[tokenAddress][entry.timestamp]) {
              assetToDateToBorrowerRate[tokenAddress][entry.timestamp] = value;
            }
        } else if (entry.side === "LENDER") {
            tokenRatesLender[tokenAddress].push({
                date: entry.timestamp,
                value, 
            })
            if(!assetToDateToLenderRate[tokenAddress]) {
              assetToDateToLenderRate[tokenAddress] = {};
              assetToDateToLenderRate[tokenAddress][entry.timestamp] = value;
            } else if (!assetToDateToLenderRate[tokenAddress][entry.timestamp]) {
              assetToDateToLenderRate[tokenAddress][entry.timestamp] = value;
            }
        }
      }

      for(let entry of siloRatesHourly) {
        let tokenAddress = entry.asset.address;
        let tokenSymbol = entry.asset.symbol;

        if(!siloInputTokenAddressLocal) {
          siloInputTokenAddressLocal = entry.silo.input_token_address;
        }

        if(!tokenAddressToSymbol[tokenAddress]) {
            tokenAddressToSymbol[tokenAddress] = tokenSymbol
        }
        if(!tokenSymbolToAddress[tokenSymbol]) {
            tokenSymbolToAddress[tokenSymbol] = tokenAddress
        }
        
        if(!tokenRatesBorrower[tokenAddress]) {
            tokenRatesBorrower[tokenAddress] = [];
        }
        if(!tokenRatesLender[tokenAddress]) {
            tokenRatesLender[tokenAddress] = [];
        }

        if(!tokenAddressHasNonZeroData[tokenAddress]) {
            tokenAddressHasNonZeroData[tokenAddress] = false;
        }

        let value = Number(Number(entry.rate).toFixed(3));

        if(value > 0 && !tokenAddressHasNonZeroData[tokenAddress]) {
            tokenAddressHasNonZeroData[tokenAddress] = true;
        }

        let setHourlyRecord = false;

        if(entry.side === "BORROWER") {
          if(!assetToDateToBorrowerRate[tokenAddress]) {
            assetToDateToBorrowerRate[tokenAddress] = {};
            assetToDateToBorrowerRate[tokenAddress][entry.timestamp] = value;
            setHourlyRecord = true;
          } else if (!assetToDateToBorrowerRate[tokenAddress][entry.timestamp]) {
            assetToDateToBorrowerRate[tokenAddress][entry.timestamp] = value;
            setHourlyRecord = true;
          }
          if(setHourlyRecord) {
            tokenRatesBorrower[tokenAddress].push({
              date: entry.timestamp,
              value,
            })
          }
        } else if (entry.side === "LENDER") {
          if(!assetToDateToLenderRate[tokenAddress]) {
            assetToDateToLenderRate[tokenAddress] = {};
            assetToDateToLenderRate[tokenAddress][entry.timestamp] = value;
            setHourlyRecord = true;
          } else if (!assetToDateToLenderRate[tokenAddress][entry.timestamp]) {
            assetToDateToLenderRate[tokenAddress][entry.timestamp] = value;
            setHourlyRecord = true;
          }
          if(setHourlyRecord) {
            tokenRatesLender[tokenAddress].push({
              date: entry.timestamp,
              value, 
            })
          }
        }
      }

      for(let [tokenAddress, timeseries] of Object.entries(tokenRatesBorrower)) {
        tokenRatesBorrower[tokenAddress] = timeseries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      }

      for(let [tokenAddress, timeseries] of Object.entries(tokenRatesLender)) {
        tokenRatesLender[tokenAddress] = timeseries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      }

      // keeping this for when I add a filter to hide 0 rate options
      // setTokenAddressHasNonZeroRate(tokenAddressHasNonZeroData);

      setSiloInputTokenAddress(siloInputTokenAddressLocal);

      setBorrowerRates(tokenRatesBorrower);
      setLenderRates(tokenRatesLender);
      setTokenAddressToSymbolMapping(tokenAddressToSymbol);
    });
  }, [tokenSymbol])

  useEffect(() => {
    if(siloInputTokenAddress) {
      setChartAssetSelection(siloInputTokenAddress)
    }
  }, [siloInputTokenAddress])

  return (
    <>
      <div className={isConsideredMobile ? "flex-col flex-center-all" : "flex"}>
        <img
          src={tokenSymbol ? `https://app.silo.finance/images/logos/${tokenSymbol}.png` : "https://vagabond-public-storage.s3.eu-west-2.amazonaws.com/silo-circle.png"}
          style={{
            width: 56,
            height: 56,
            marginRight: isConsideredMobile ? 0 : 24,
            marginBottom: isConsideredMobile ? 24 : 0,
          }}
          onError={({ currentTarget }) => {
            currentTarget.onerror = null; // prevents looping
            currentTarget.src="https://vagabond-public-storage.s3.eu-west-2.amazonaws.com/question-mark-white.svg";
          }}
          alt="selected silo logo"
        />
        {tokenSymbol &&
          <FormControl fullWidth style={{marginBottom: 24, marginRight: isConsideredMobile ? 0 : 24, maxWidth: isConsideredMobile ? '100%' : 180}}>
              <InputLabel id="select-label-silo-zone">Zone</InputLabel>
              <Select
                  labelId="select-label-silo-zone"
                  id="select-label-silo-zone"
                  value={siloZoneSelection}
                  label="Zone"
                  onChange={overrideHandleSiloZoneChange ? overrideHandleSiloZoneChange : handleSiloZoneChange}
                  disabled={(!siloInputTokenAddress || !chartAssetSelection || !tokenAddressToSymbolMapping[siloInputTokenAddress])}
              >
                  <MenuItem value={'tvl+borrowed'}>TVL & Borrowed</MenuItem>
                  <MenuItem value={'rates'}>Rates</MenuItem>
              </Select>
          </FormControl>
        }
        {siloInputTokenAddress && chartAssetSelection && tokenAddressToSymbolMapping[siloInputTokenAddress] &&
          <FormControl fullWidth style={{marginBottom: 24, marginRight: isConsideredMobile ? 0 : 24, maxWidth: isConsideredMobile ? '100%' : 150}}>
            <InputLabel id="rate-chart-asset-selection">Silo Asset Selection</InputLabel>
            <Select
                labelId="rate-chart-asset-selection"
                id="rate-chart-asset-selection"
                value={chartAssetSelection}
                label="Silo Asset Selection"
                onChange={handleChartAssetChange}
                disabled={(!siloInputTokenAddress || !chartAssetSelection || !tokenAddressToSymbolMapping[siloInputTokenAddress])}
            >
              {Object.entries(tokenAddressToSymbolMapping).map(([address, symbol]) => {
                return (
                  <MenuItem key={`asset-selection-${address}`} value={address}>{symbol}</MenuItem>
                )
              })}
            </Select>
          </FormControl>
        }
        {(!siloInputTokenAddress || !chartAssetSelection || !tokenAddressToSymbolMapping[siloInputTokenAddress]) &&
          <FormControl fullWidth style={{marginBottom: 24, marginRight: isConsideredMobile ? 0 : 24, maxWidth: isConsideredMobile ? '100%' : 150}}>
            <InputLabel id="rate-chart-asset-selection">Silo Asset Selection</InputLabel>
            <Select
                labelId="rate-chart-asset-selection"
                id="rate-chart-asset-selection"
                value={"loading"}
                disabled={true}
                label="Silo Asset Selection"
            >
              <MenuItem key={`asset-selection-loading`} value={"loading"}>Loading...</MenuItem>
            </Select>
          </FormControl>
        }
        <FormControl fullWidth style={{marginBottom: 25, marginRight: 0, maxWidth: isConsideredMobile ? '100%' : 180}}>
          <InputLabel id="rate-chart-type-selection">Chart Selection</InputLabel>
          <Select
              labelId="rate-chart-type-selection"
              id="rate-chart-type-selection"
              value={chartTypeSelection}
              label="Chart Selection"
              onChange={handleChartTypeChange}
              disabled={(!siloInputTokenAddress || !chartAssetSelection || !tokenAddressToSymbolMapping[siloInputTokenAddress])}
          >
              <MenuItem value={'borrower'}>Borrower APY</MenuItem>
              <MenuItem value={'lender'}>Lender APY</MenuItem>
          </Select>
        </FormControl>
      </div>
      {((chartTypeSelection === "borrower" && Object.entries(borrowerRates)?.length === 0) || (chartTypeSelection === "lender" && Object.entries(lenderRates)?.length === 0)) &&
          <div key={`borrower-lender-chart-placeholder`}>
              <div>
                  <div style={{width: '100%'}}>
                      <BasicAreaChartContainer
                          chartData={[]}
                          leftTextTitle={`Loading...`}
                          leftTextSubtitle={`Loading...`}
                          rightText={`Loading...`}
                          showChange={true}
                          changeType={"neutral"}
                          height={500}
                          isPercentage={true}
                          formatValueFn={(value: any) => `${value}`}
                      />
                  </div>
              </div>
          </div>
      }
      {chartTypeSelection === "borrower" && Object.entries(borrowerRates).map((value, index) => 
          <div key={`borrower-chart-${value[0]}`}>
            {value[0] === chartAssetSelection &&
              <div>
                  <div style={{width: '100%'}}>
                      <BasicAreaChartContainer
                          chartData={value[1]}
                          leftTextTitle={`${tokenAddressToSymbolMapping[value[0]]} APY`}
                          leftTextSubtitle={`Borrower`}
                          rightText={`${value[1][value[1].length - 1].value.toFixed(2)} % APY`}
                          showChange={true}
                          changeType={"neutral"}
                          height={500}
                          isPercentage={true}
                          formatValueFn={(value: any) => `${value} % APY`}
                      />
                  </div>
              </div>
            }
          </div>
      )}
      {chartTypeSelection === "lender" && Object.entries(lenderRates).map((value, index) => 
        <div key={`lender-chart-${value[0]}`}>
          {value[0] === chartAssetSelection &&
            <div>
                <div style={{width: '100%'}}>
                    <BasicAreaChartContainer
                        chartData={value[1]}
                        leftTextTitle={`${tokenAddressToSymbolMapping[value[0]]} APY`}
                        leftTextSubtitle={`Lender`}
                        rightText={`${value[1][value[1].length - 1].value.toFixed(2)} % APY`}
                        showChange={true}
                        changeType={"neutral"}
                        height={500}
                        isPercentage={true}
                        formatValueFn={(value: any) => `${value} % APY`}
                    />
                </div>
            </div>
          }
        </div>
      )}
    </>
  )
};

export default RateChartSelection;