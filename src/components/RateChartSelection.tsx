import React, {useEffect, useState} from 'react';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import { API_ENDPOINT } from '../constants';

import BasicAreaChartContainer from '../components/BasicAreaChart';

interface IRateChartSelection {
    tokenSymbol: string;
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

  const { tokenSymbol } = props;

  const [borrowerRates, setBorrowerRates] = useState<ITokenRates>({});
  const [lenderRates, setLenderRates] = useState<ITokenRates>({});
  const [tokenAddressToSymbolMapping, setTokenAddressToSymbolMapping] = useState<ISymbolAddressMapping>({});

  // keeping this for when I add a filter to hide 0 rate options
  // const [tokenAddressHasNonZeroRate, setTokenAddressHasNonZeroRate] = useState<IAddressBooleanMapping>({});

  const [siloInputTokenAddress, setSiloInputTokenAddress] = useState<string | undefined>();
  const [chartTypeSelection, setChartTypeSelection] = useState<string>('borrower');
  const [chartAssetSelection, setChartAssetSelection] = useState<string | undefined>();

  const handleChartTypeChange = (event: SelectChangeEvent) => {
    setChartTypeSelection(event.target.value as string);
  };

  const handleChartAssetChange = (event: SelectChangeEvent) => {
    setChartAssetSelection(event.target.value as string);
};

  useEffect(() => {
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
      <div style={{marginTop: 50}}/>
      {siloInputTokenAddress && chartAssetSelection && tokenAddressToSymbolMapping[siloInputTokenAddress] &&
        <FormControl fullWidth style={{marginBottom: 25, marginRight: 25, maxWidth: 150}}>
          <InputLabel id="rate-chart-asset-selection">Silo Asset Selection</InputLabel>
          <Select
              labelId="rate-chart-asset-selection"
              id="rate-chart-asset-selection"
              value={chartAssetSelection}
              label="Silo Asset Selection"
              onChange={handleChartAssetChange}
          >
            {Object.entries(tokenAddressToSymbolMapping).map(([address, symbol]) => {
              return (
                <MenuItem key={`asset-selection-${address}`} value={address}>{symbol}</MenuItem>
              )
            })}
          </Select>
        </FormControl>
      }
      <FormControl fullWidth style={{marginBottom: 25, maxWidth: 180}}>
        <InputLabel id="rate-chart-type-selection">Chart Selection</InputLabel>
        <Select
            labelId="rate-chart-type-selection"
            id="rate-chart-type-selection"
            value={chartTypeSelection}
            label="Chart Selection"
            onChange={handleChartTypeChange}
        >
            <MenuItem value={'borrower'}>Borrower APY</MenuItem>
            <MenuItem value={'lender'}>Lender APY</MenuItem>
        </Select>
      </FormControl>
      {chartTypeSelection === "borrower" && Object.entries(borrowerRates).map((value, index) => 
          <div key={`borrower-chart-${value[0]}`}>
            {value[0] === chartAssetSelection &&
              <div style={{marginBottom: 50}}>
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
            <div style={{marginBottom: 50}}>
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