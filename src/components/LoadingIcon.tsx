import React from 'react';

import { styled } from '@mui/material/styles';

import { animated, useSpring, config } from '@react-spring/web'

import LogoDarkMode from '../assets/png/logo.png'

const LoadingIconContainer = styled('div')(({ theme }) => ({
  position: 'absolute',
  zIndex: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

interface ILoadingIconProps {
  height: number;
}

export default function LoadingIcon(props: ILoadingIconProps) {

  const {
    height,
  } = props;

  const loadingSpring = useSpring({
    from: {
      rotate: '0deg',
      width: 'auto',
      height: 100,
      opacity: 0.6,
    },
    to: {
      rotate: "180deg",
      width: 'auto',
      height: 100,
      opacity: 0.6,
    },
    loop: true,
    delay: 150,
    config: config.wobbly,
  })

  return (
    <LoadingIconContainer style={{height: height, width: '100%'}}>
      <animated.img style={loadingSpring} src={LogoDarkMode} alt="loading icon" />
    </LoadingIconContainer>
  );
}