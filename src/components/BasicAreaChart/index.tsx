import React, {useEffect, useState} from 'react';

import BigNumber from 'bignumber.js';

import Typography from '@mui/material/Typography';

import ParentSize from '@visx/responsive/lib/components/ParentSize';

import BasicAreaChartInner from './BasicAreaChartInner'
import BrushChart from '../BrushChart';

import { priceFormat } from '../../utils';

BigNumber.config({ EXPONENTIAL_AT: 1e+9 });

export interface ITimeseries {
  date: string;
  value: number;
}

interface IBasicAreaChartProps {
  chartData: ITimeseries[]
  height: number
  leftTextTitle?: string
  leftTextSubtitle?: string
  rightText?: string
  showChange?: boolean
  changeType?: "neutral" | "up-good" | "down-good",
  isPercentage?: boolean,
  formatValueFn: (arg1: string | number) => string,
  isConsideredMobile: boolean
}

const neutralColor = "#ff14fc";
const goodColor = "limegreen";
const badColor = "orange";

const BasicAreaChart = (props: IBasicAreaChartProps) => {

    const {
      chartData,
      height,
      leftTextTitle,
      leftTextSubtitle,
      rightText,
      showChange,
      changeType,
      isPercentage,
      formatValueFn,
      isConsideredMobile,
    } = props;

    const [filteredChartData, setFilteredChartData] = useState(chartData);

    useEffect(() => {
      setFilteredChartData(chartData);
    }, [chartData])

    const getChange = (firstValue: number, lastValue: number) => {
      let returnString = "+ 0.00 %"
      if(lastValue > firstValue) {
        if(isPercentage) {
          returnString = `+ ${priceFormat(Number((lastValue - firstValue).toFixed(2)), 2, '%', false)}`
        } else {
          returnString = `+ ${priceFormat(Math.abs(new BigNumber(lastValue).multipliedBy(100).dividedBy(firstValue).minus(100).decimalPlaces(2).toNumber()), 2, '%', false)}`
        }
      } else if (firstValue > lastValue) {
        if(isPercentage) {
          returnString = `- ${priceFormat(Number(Math.abs(lastValue - firstValue).toFixed(2)), 2, '%', false)} %`
        } else {
          returnString = `- ${priceFormat(Math.abs(new BigNumber(lastValue).multipliedBy(100).dividedBy(firstValue).minus(100).decimalPlaces(2).toNumber()), 2, '%', false)} %`
        }
      }
      return returnString;
    }

    const getChangeColor = (firstValue: number, lastValue: number) => {
      let changeColor = '#ffffff';
      let change = lastValue - firstValue;
      if(change < 0) {
        if(changeType === "neutral") {
          changeColor = neutralColor
        }
        if (changeType === 'up-good') {
          changeColor = badColor
        }
        if (changeType === 'down-good') {
          changeColor = goodColor
        }
      }
      if(change > 0) {
        if(changeType === "neutral") {
          changeColor = neutralColor
        }
        if (changeType === 'up-good') {
          changeColor = goodColor
        }
        if (changeType === 'down-good') {
          changeColor = badColor
        }
      }
      return changeColor;
    }

    return (
      <div style={{minHeight: height, width: '100%', position: 'relative', borderRadius: 10, backgroundColor: 'black'}}>
          <div
            style={{
              height: 76,
              width: '100%',
              backgroundColor: 'black',
              borderTopRightRadius: 10,
              borderTopLeftRadius: 10,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingLeft: 15,
              paddingRight: 15,
            }}
          >
            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
              {leftTextTitle &&
                <Typography variant="h6" style={{lineHeight: 1, marginBottom: 10}}>
                  {leftTextTitle}
                </Typography>
              }
              {leftTextSubtitle &&
                <Typography variant="subtitle1" style={{lineHeight: 1, alignSelf: 'start', fontWeight: 'bold'}}>
                  {leftTextSubtitle}
                </Typography>
              }
            </div>
            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
              <Typography variant="h6" style={{lineHeight: 1, marginBottom: 10}}>
                {rightText}
              </Typography>
              {showChange &&
                <Typography variant="subtitle1" style={{lineHeight: 1, alignSelf: 'end', color: getChangeColor(filteredChartData[0].value, filteredChartData[filteredChartData.length - 1].value)}}>
                  {getChange(filteredChartData[0].value, filteredChartData[filteredChartData.length - 1].value)}
                </Typography>
              }
            </div>
          </div>
          {chartData && (chartData.length > 0) &&
          <>
            <ParentSize className="graph-container" debounceTime={10}>
                {({ width: w }) => {
                    return (
                        <>
                          <BasicAreaChartInner
                              width={w}
                              height={height}
                              timeseries={filteredChartData}
                              formatValue={formatValueFn}
                          />
                        </>
                    )
                }}
            </ParentSize>
            {!isConsideredMobile &&
              <div style={{padding: 10}}>
                <ParentSize className="graph-container" debounceTime={10}>
                  {({ width: w }) => {
                      return (
                        <>
                          {chartData && chartData.length > 0 && 
                            <BrushChart 
                              timeseries={chartData}
                              setFilteredChartData={setFilteredChartData}
                              height={100}
                              width={w}
                            />
                          }
                        </>
                      )
                  }}
                </ParentSize>
              </div>
            }
          </>    
        }
      </div>
    )
};

export default BasicAreaChart;