import React from 'react';

import { styled } from '@mui/material/styles';

import { animated, useSpring, config } from '@react-spring/web'

import SyncIcon from '@mui/icons-material/Sync';

const LoadingIconContainer = styled('div')(({ theme }) => ({
  zIndex: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 'inherit',
  left: 0,
}));

interface ILoadingIconProps {
  height: number;
  iconHeight?: number;
  position?: string | undefined;
  relative?: boolean;
}

export default function LoadingIcon(props: ILoadingIconProps) {

  const {
    height,
    iconHeight,
    relative = false,
  } = props;

  const loadingSpring = useSpring({
    from: {
      rotate: '0deg',
      width: 'auto',
      height: iconHeight ? iconHeight : 100,
      opacity: 0.6,
    },
    to: {
      rotate: "180deg",
      width: 'auto',
      height: iconHeight ? iconHeight : 100,
      opacity: 0.6,
    },
    loop: true,
    delay: 150,
    config: config.wobbly,
  })

  return (
    <LoadingIconContainer style={{height: height, position: relative ? 'relative' : 'absolute', width: '100%'}}>
      <animated.div style={loadingSpring}>
        <SyncIcon style={{height: iconHeight, width: iconHeight }} />
      </animated.div>
    </LoadingIconContainer>
  );
}