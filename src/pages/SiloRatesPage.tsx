import React, {useEffect, useState} from 'react';

import Container from '@mui/material/Container';

import { API_ENDPOINT } from '../constants';

import BasicAreaChartContainer from '../components/BasicAreaChart';

interface ISiloPageProps {
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

const SiloPage = (props: ISiloPageProps) => {

    const { tokenSymbol } = props;

    const [borrowerRates, setBorrowerRates] = useState<ITokenRates>({});
    const [lenderRates, setLenderRates] = useState<ITokenRates>({});
    const [tokenAddressToSymbolMapping, setTokenAddressToSymbolMapping] = useState<ISymbolAddressMapping>({});
    const [tokenAddressHasNonZeroRate, setTokenAddressHasNonZeroRate] = useState<IAddressBooleanMapping>({});

    useEffect(() => {
        fetch(`${API_ENDPOINT}/rates/silo/${tokenSymbol}?perPage=8640`).then(data => data.json()).then(data => {

            // Group rates by asset (e.g. BAL/XAI/WETH, but using the asset address) and by side (BORROWER/LENDER)

            let tokenAddressToSymbol : ISymbolAddressMapping = {};
            let tokenSymbolToAddress : ISymbolAddressMapping = {};

            let tokenRatesBorrower : ITokenRates = {};
            let tokenRatesLender : ITokenRates = {};

            let tokenAddressHasNonZeroData : IAddressBooleanMapping = {};

            let iteration = data.data.reverse();
            for(let entry of iteration) {
                let tokenAddress = entry.asset.address;
                let tokenSymbol = entry.asset.symbol;

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
                } else if (entry.side === "LENDER") {
                    tokenRatesLender[tokenAddress].push({
                        date: entry.timestamp,
                        value, 
                    })
                }
            }

            setTokenAddressHasNonZeroRate(tokenAddressHasNonZeroData);
            setBorrowerRates(tokenRatesBorrower);
            setLenderRates(tokenRatesLender);
            setTokenAddressToSymbolMapping(tokenAddressToSymbol);
        });
        
    }, [tokenSymbol])

    return (
        <Container maxWidth="lg">
            <div style={{marginTop: 50}}/>
            {Object.entries(borrowerRates).map((value, index) => 
                <>
                    {tokenAddressHasNonZeroRate[value[0]] &&
                        <>
                            <div style={{marginBottom: 50}}>
                                <div style={{width: '100%'}}>
                                    <BasicAreaChartContainer
                                        chartData={value[1]}
                                        leftTextTitle={`${tokenAddressToSymbolMapping[value[0]]} APY (Borrower)`}
                                        rightText={`${value[1][value[1].length - 1].value.toFixed(2)} % APY`}
                                        showChange={true}
                                        changeType={"neutral"}
                                        height={500}
                                        isPercentage={true}
                                        formatValueFn={(value: any) => `${value} % APY`}
                                    />
                                </div>
                            </div>
                            {lenderRates[value[0]] &&
                                <div style={{marginBottom: 50}}>
                                    <div style={{width: '100%'}}>
                                        <BasicAreaChartContainer
                                            chartData={lenderRates[value[0]]}
                                            leftTextTitle={`${tokenAddressToSymbolMapping[value[0]]} APY (Lender)`}
                                            rightText={`${lenderRates[value[0]][lenderRates[value[0]].length - 1].value.toFixed(2)} % APY`}
                                            showChange={true}
                                            changeType={"neutral"}
                                            height={500}
                                            isPercentage={true}
                                            formatValueFn={(value: any) => `${value} % APY`}
                                        />
                                    </div>
                                </div>
                            }
                        </>
                    }
                </>
            )}
        </Container>
    )
};

export default SiloPage;