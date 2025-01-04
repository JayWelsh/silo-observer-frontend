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

interface IStyledTooltip {
  maxHeight?: string;
}

const StyledTooltip = styled.div<IStyledTooltip>`
  background-color: black;
  opacity: 0.9;
  padding-top: 4px;
  padding-bottom: 4px;
  padding-left: 24px;
  padding-right: 24px;
  border: 1px solid #fff;
  border-radius: 8px;
  max-height: ${props => props.maxHeight ? props.maxHeight : `650px`};
`

const StyledTooltipText = styled.p`
  font-weight: bold;
`

interface IStyledTooltipTextStacked {
  first?: boolean
  last?: boolean
  fontSize?: string
}

const StyledTooltipTextStacked = styled.p<IStyledTooltipTextStacked>`
  font-weight: bold;
  font-size: ${props => props.fontSize ? props.fontSize : `14px`};
  margin-top: ${props => props.first ? `1em` : `6px`};
  margin-bottom: ${props => props.last ? `1em` : `6px`};
  white-space: nowrap;
`

interface ICustomTooltip {
  isConsideredMobile: boolean;
}

const getTooltipEntryFontSize = (isConsideredMobile: boolean, override: string | undefined) => {
  if(override) {
    return override;
  }
  return isConsideredMobile ? "11px" : "14px";
};

const CustomTooltip = (props: TooltipProps<ValueType, NameType> & ICustomTooltip) => {
  let { active, payload, isConsideredMobile } = props;
  if (active && payload && payload.length) {
    let groupedData = payload[0].payload?.groupedData;
    let groupedDataTooltipTitle = payload[0].payload?.groupedDataTooltipTitle;
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
      <StyledTooltip maxHeight={isConsideredMobile ? "550px" : "650px"}>
        {groupedData && 
          <div style={{textAlign: 'left'}}>
            <StyledTooltipTextStacked fontSize={isConsideredMobile ? "11px" : "14px"} first={true} style={{textDecoration: 'underline'}}>{`${groupedDataTooltipTitle ? groupedDataTooltipTitle : payload[0].name}`}</StyledTooltipTextStacked>
            <div style={{display: 'flex'}}>
              {
                groupedDataInColumns.map((columnData, index) => 
                  <div key={`grouped-tooltip-column-${index}`} style={(index > 0) ? { marginLeft: 32 } : {}}>
                    {
                      columnData.map((entry: IPieData, dataIndex: number) => 
                        <StyledTooltipTextStacked fontSize={getTooltipEntryFontSize(isConsideredMobile, payload ? payload[0].payload?.groupedTooltipFontSize : undefined)} key={`grouped-tooltip-column-data-${index}-${dataIndex}`} last={dataIndex === (columnData.length - 1)}>{entry.tooltipFormatFn ? entry.tooltipFormatFn(entry) : `${centerShortenLongString(entry.name, 12)}: ${entry.value} %`}</StyledTooltipTextStacked>
                      )
                    }
                  </div>
                )
              }
            </div>
          </div>
        }
        {!groupedData && 
          <StyledTooltipText>{payload[0].payload.tooltipFormatFn ? payload[0].payload.tooltipFormatFn(payload[0].payload) : `${centerShortenLongString(payload[0].payload.name, 12)}: ${payload[0].payload.value} %`}</StyledTooltipText>
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
  desktopHeight?: number
  mobileHeight?: number
  paddingTop?: number
  paddingBottom?: number
  labelFontSize?: string
  disableLabels?: boolean
}

const PieChartInternal = (props: IProps & PropsFromRedux) => {

  const { 
    data,
    loading,
    title,
    isConsideredMobile,
    desktopHeight,
    mobileHeight,
    paddingTop = 0,
    paddingBottom = 32,
    labelFontSize = '1rem',
    disableLabels,
  } = props;

  const [showLabels, setShowLabels] = useState(true);
  // const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const windowSize = useWindowSize();

  useLayoutEffect(() => {
    let sizeHideLabels = 900;
    if (disableLabels || (windowSize.width && (windowSize.width <= sizeHideLabels))) {
      setShowLabels(false);
    }else{
      setShowLabels(true);
    }
  }, [windowSize.width, windowSize.height, disableLabels])

  const colorGaps = Number((1 / data.length).toFixed(4));

  const dataWithFills = (dataToFill: IPieData[]) => { 
    return [...dataToFill].map((entry, index) => {
      if(!entry.fill) {
        let colorSector = colorGaps * (index + 1);
        entry.fill = color(colorSector);
      }
      return entry;
    })
  }

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

  const defaultMobileHeight = 550;
  const defaultDesktopHeight = 650;

  const internalDesktopHeight = desktopHeight ? desktopHeight : defaultDesktopHeight;
  const internalMobileHeight = mobileHeight ? mobileHeight : defaultMobileHeight;

  return (
    <>
      {loading &&
        <LoadingIcon height={isConsideredMobile ? internalMobileHeight : internalDesktopHeight} />
      }
      {title && 
        <Typography variant="h6" style={{lineHeight: 1, marginBottom: 10, textAlign: isConsideredMobile ? 'center' : 'left'}}>
          {title || 'Loading...'}
        </Typography>
      }
      <div style={{height: isConsideredMobile ? internalMobileHeight : internalDesktopHeight, fontSize: labelFontSize, position: 'relative', paddingLeft: 16, paddingRight: 16, paddingBottom, paddingTop }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart 
            width={internalMobileHeight}
            height={internalMobileHeight}
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
              // activeIndex={activeIndex}
              data={dataWithFills(data)}
              dataKey="value"
              cx="50%"
              cy="50%"
              fill="#8884d8"
              label={
                showLabels
                ? 
                  function(entry: IPieData) {
                    if(entry.labelFormatFn) {
                      return entry.labelFormatFn(entry);
                    }
                    return `${entry.name} (${entry.value.toFixed(2)} %)`;
                  }
                : 
                  undefined
              }
              activeShape={isConsideredMobile ? undefined : renderActiveShape}
              // onClick={(data, index) => setActiveIndex(index)}
            />
            <Legend layout="horizontal" align="center" />
            <Tooltip
              
              content={<CustomTooltip isConsideredMobile={isConsideredMobile} />}
              wrapperStyle={{
                zIndex: 1,
                // visibility: "visible"
              }}
              // allowEscapeViewBox={{ x: true, y: true }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

export default PieChartInternal;