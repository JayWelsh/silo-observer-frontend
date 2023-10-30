import React, { useLayoutEffect, useState } from 'react';
import { PieChart, Pie, Sector, Legend, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import {
  ValueType,
  NameType,
} from 'recharts/types/component/DefaultTooltipContent';
import {
  PieSectorDataItem,
} from 'recharts/types/polar/Pie';
import { interpolateRainbow } from 'd3-scale-chromatic';
import { scaleSequential } from 'd3-scale';
import styled from 'styled-components'
import Typography from '@mui/material/Typography';

import { useWindowSize } from '../../hooks'

import { IPieData } from '../../interfaces';

import { PropsFromRedux } from '../../containers/PieChartContainer';

import LoadingIcon from '../LoadingIcon';

const color = scaleSequential(interpolateRainbow);

const StyledTooltip = styled.div`
  background-color: black;
  opacity: 0.9;
  padding-top: 4px;
  padding-bottom: 4px;
  padding-left: 24px;
  padding-right: 24px;
  border: 1px solid #fff;
  border-radius: 8px;
`

const StyledTooltipText = styled.p`
  font-weight: bold;
`

interface IStyledTooltipTextStacked {
  first?: boolean
  last?: boolean
}

const StyledTooltipTextStacked = styled.p<IStyledTooltipTextStacked>`
  font-weight: bold;
  font-size: 14px;
  margin-top: ${props => props.first ? `1em` : 6}px;
  margin-bottom: ${props => props.last ? `1em` : 6}px;
`

const CustomTooltip = (props: TooltipProps<ValueType, NameType>) => {
  let { active, payload } = props;
  if (active && payload && payload.length) {
    let groupedData = payload[0].payload?.groupedData;
    return (
      <StyledTooltip>
        {groupedData && 
          <>
            <StyledTooltipTextStacked first={true} style={{textDecoration: 'underline'}}>{`${payload[0].name}`}</StyledTooltipTextStacked>
            {
              groupedData.map((entry: IPieData, index: number) => 
                <StyledTooltipTextStacked last={index === (groupedData.length - 1)}>{`${entry.name} : ${entry.value} %`}</StyledTooltipTextStacked>
              )
            }
          </>
        }
        {!groupedData && 
          <StyledTooltipText>{`${payload[0].name} : ${payload[0].value} %`}</StyledTooltipText>
        }
      </StyledTooltip>
    );
  }
  return null;
};

interface IProps {
  data: IPieData[]
  loading?: boolean
  title?: string
}

const PieChartInternal = (props: IProps & PropsFromRedux) => {

  const { 
    data,
    loading,
    title,
    // isConsideredMobile,
  } = props;

  const [showLabels, setShowLabels] = useState(true);

  const windowSize = useWindowSize();

  useLayoutEffect(() => {
    let sizeHideLabels = 900;
    if (windowSize.width && (windowSize.width <= sizeHideLabels)) {
      setShowLabels(false);
    }else{
      setShowLabels(true);
    }
  }, [windowSize.width, windowSize.height])

  const colorGaps = Number((1 / data.length).toFixed(4));

  const dataWithFills = data.map((entry, index) => {
    let colorSector = colorGaps * (index + 1);
    console.log({colorGaps, colorSector})
    entry.fill = color(colorSector);
    return entry;
  })

  const renderActiveShape = (props: PieSectorDataItem) => {
    const { 
      cx,
      cy,
      innerRadius,
      outerRadius = 0,
      startAngle,
      endAngle,
      fill,
    } = props;
  
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius+8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={"#FFF"}
        />
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius+7}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  return (
    <>
      <Typography variant="h6" style={{lineHeight: 1, marginBottom: 10}}>
        {title || 'Loading...'}
      </Typography>
      <div style={{height: 600, position: 'relative', paddingLeft: 16, paddingRight: 16, paddingBottom: 32 }}>
        {loading &&
          <LoadingIcon height={600} />
        }
        
        <ResponsiveContainer width="100%" height="100%">
          <PieChart 
            width={500}
            height={500} 
            onMouseMove={(next, e) => {
              let toolTipWrapper = document.getElementsByClassName("recharts-tooltip-wrapper")[0] as HTMLElement;
              // toolTipWrapper.style.transition = 'transform 0ms ease 0s';
              if(toolTipWrapper.clientHeight > 273) {
                toolTipWrapper.style.top = `${toolTipWrapper.clientHeight / 2}px`;
              } else {
                toolTipWrapper.style.top = "0px";
              }
            }}
          >
            <Pie 
              data={dataWithFills}
              dataKey="value"
              cx="50%"
              cy="50%"
              fill="#8884d8"
              label={
                showLabels
                ? 
                  function(entry: IPieData) {
                    return `${entry.name} (${entry.value} %)`;
                  }
                : 
                  undefined
              }
              activeShape={renderActiveShape}
            />
            <Legend layout="horizontal" align="center" />
            <Tooltip
              content={<CustomTooltip />}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

export default PieChartInternal;