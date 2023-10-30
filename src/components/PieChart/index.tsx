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

import { centerShortenLongString } from '../../utils';

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
  max-height: 650px;
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
  margin-top: ${props => props.first ? `1em` : `6px`};
  margin-bottom: ${props => props.last ? `1em` : `6px`};
`

const CustomTooltip = (props: TooltipProps<ValueType, NameType>) => {
  let { active, payload } = props;
  if (active && payload && payload.length) {
    let groupedData = payload[0].payload?.groupedData;
    let maxColumnLength = 18;
    let columnCount = 1;
    let groupedDataInColumns = [groupedData];
    let lastIndex = 0;
    if(groupedData?.length > 0) {
      columnCount = Math.ceil(groupedData.length / maxColumnLength);
      groupedDataInColumns = [];
      for(let i = 0; i < columnCount; i++) {
        let columnData = groupedData.slice(lastIndex, lastIndex + maxColumnLength);
        lastIndex = lastIndex + maxColumnLength;
        groupedDataInColumns.push(columnData);
      }
    }
    return (
      <StyledTooltip>
        {groupedData && 
          <>
            <StyledTooltipTextStacked first={true} style={{textDecoration: 'underline'}}>{`${payload[0].name}`}</StyledTooltipTextStacked>
            <div style={{display: 'flex'}}>
              {
                groupedDataInColumns.map((columnData, index) => 
                  <div key={`grouped-tooltip-column-${index}`} style={(index > 0) ? { marginLeft: 32 } : {}}>
                    {
                      columnData.map((entry: IPieData, dataIndex: number) => 
                        <StyledTooltipTextStacked key={`grouped-tooltip-column-data-${index}-${dataIndex}`} last={dataIndex === (columnData.length - 1)}>{`${centerShortenLongString(entry.name, 12)}: ${entry.value} %`}</StyledTooltipTextStacked>
                      )
                    }
                  </div>
                )
              }
            </div>
          </>
        }
        {!groupedData && 
          <StyledTooltipText>{`${payload[0].name}: ${payload[0].value} %`}</StyledTooltipText>
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
      {title && 
        <Typography variant="h6" style={{lineHeight: 1, marginBottom: 10}}>
          {title || 'Loading...'}
        </Typography>
      }
      <div style={{height: 650, position: 'relative', paddingLeft: 16, paddingRight: 16, paddingBottom: 32 }}>
        {loading &&
          <LoadingIcon height={650} />
        }
        <ResponsiveContainer width="100%" height="100%">
          <PieChart 
            width={550}
            height={550} 
            onMouseMove={(next, e) => {
              let toolTipWrapper = document.getElementsByClassName("recharts-tooltip-wrapper")[0] as HTMLElement;
              // toolTipWrapper.style.transition = 'transform 0ms ease 0s';
              if(toolTipWrapper.clientHeight > 273) {
                // toolTipWrapper.style.top = `${toolTipWrapper.clientHeight / 2}px`;
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
                    return `${entry.name} (${entry.value.toFixed(2)} %)`;
                  }
                : 
                  undefined
              }
              activeShape={renderActiveShape}
            />
            <Legend layout="horizontal" align="center" />
            <Tooltip
              content={<CustomTooltip />}
              // wrapperStyle={{ visibility: "visible" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

export default PieChartInternal;