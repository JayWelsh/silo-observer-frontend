import React, { useState, useEffect } from 'react';

import { animated, useSpring, config } from '@react-spring/web'

import { useNavigate } from "react-router-dom";

import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import GitHubIcon from '@mui/icons-material/GitHub';
// import IconButton from '@mui/material/IconButton';
// import MenuIcon from '@mui/icons-material/Menu';
// import DarkModeIcon from '@mui/icons-material/NightsStay';
// import LightModeIcon from '@mui/icons-material/WbSunny';

import DiscordLogo from '../assets/svg/discord.svg';

import LogoDarkMode from '../assets/png/logo.png'
import LogoLightMode from '../assets/png/logo.png'

// import { Web3ModalButton } from './Web3ModalButton';
import { PropsFromRedux } from '../containers/NavigationTopBarContainer';
import { ExternalLink } from '../components/ExternalLink';

import SiloTokenBarContainer from '../containers/SiloTokenBarContainer';
import NetworkSelectionListContainer from '../containers/NetworkSelectionListContainer';

import GithubRepoNavigatorDialog from './GithubRepoNavigatorDialog';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      cursor: 'pointer',
      fontFamily: 'monospace',
      marginRight: theme.spacing(2),
    },
    flexer: {
      flexGrow: 1,
    },
    margin: {
      margin: theme.spacing(1),
    },
    logoSpacer: {
      marginRight: theme.spacing(2),
    },
    socialIcon: {
      maxWidth: 35,
      width: '100%',
      maxHeight: 35,
      height: '100%',
      marginLeft: theme.spacing(2)
    }
  }),
);

interface INavigationTopBarProps {
  isConsideredMobile: boolean;
}

const NavigationTopBar = (props: PropsFromRedux & INavigationTopBarProps) => {
  const classes = useStyles();

  let {
    isConsideredMobile,
  } = props;

  let navigate = useNavigate();

  // const [localShowLeftMenu, setLocalShowLeftMenu] = useState(props.showLeftMenu)
  const [localDarkMode, setLocalDarkMode] = useState(props.darkMode)
  const [showGithubNavigation, setShowGithubNavigation] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);

  useEffect(() => {
    // setLocalShowLeftMenu(props.showLeftMenu)
  }, [props.showLeftMenu])

  useEffect(() => {
    setLocalDarkMode(props.darkMode)
  }, [props.darkMode])

  const logoSpring = useSpring({
    from: {
      rotate: '0deg',
    },
    to: {
      rotate: logoHovered ? "180deg" : "0deg",
    },
    config: config.wobbly,
  })

  return (
    <div className={classes.root}>
      <div style={{position: 'fixed', width: '100%', zIndex: 9, height: 30}}>
        <SiloTokenBarContainer />
        <AppBar style={{background: 'linear-gradient(-90deg, #000000, #000000)', top: isConsideredMobile ? 29 : 30}}>
          <Toolbar>
            {/* <IconButton
              onClick={() => props.setShowLeftMenu(!localShowLeftMenu)}
              edge="start"
              className={classes.menuButton}
              color="inherit"
              aria-label="menu"
              size="large">
              <MenuIcon />
            </IconButton> */}
            {/* <div style={{width: '115px', position: 'relative', marginRight: '15px', alignSelf: 'start'}}>
              <img onClick={() => props.history.push('/')} height={'115px'} style={{cursor: 'pointer', position: 'absolute', top: 10}} src={localDarkMode ? LogoDarkMode : LogoLightMode} alt="logo" />
            </div> */}
            <animated.img onMouseEnter={() => setLogoHovered(true)} onMouseLeave={() => setLogoHovered(false)} style={{...logoSpring, cursor: 'pointer'}} onClick={() => navigate('/')} height={'40px'} src={localDarkMode ? LogoDarkMode : LogoLightMode} className={[classes.logoSpacer].join(' ')} alt="logo" />
            {!isConsideredMobile &&
              <Typography onClick={() => navigate('/')} variant="h6" className={classes.title}>
                silo.observer
              </Typography>
            }
            <div className={classes.flexer}/>
            <div className={"flex-center-all"}>
              <NetworkSelectionListContainer />
              <ExternalLink className={"hover-opacity-button flex-center-all"} href={"https://discord.gg/txcZWpmrj7"}>
                <img alt="Discord Server Link" className={classes.socialIcon} style={{width: 40}} src={DiscordLogo} />
              </ExternalLink>
              <GitHubIcon onClick={() => setShowGithubNavigation(true)} style={{width: 40}} className={[classes.socialIcon, "hover-opacity-button"].join(' ')}/>
            </div>
            {/* <Web3ModalButton/>
            <IconButton
              color="inherit"
              onClick={() => props.setDarkMode(!localDarkMode)}
              aria-label="delete"
              className={classes.margin}
              size="large">
              {localDarkMode ? <LightModeIcon/> : <DarkModeIcon />}
            </IconButton> */}
          </Toolbar>
        </AppBar>
      </div>
      <div style={{height: 30}} />
      <Toolbar/>
      <GithubRepoNavigatorDialog open={showGithubNavigation} onClose={() => setShowGithubNavigation(false)}/>
    </div>
  );
}

export default NavigationTopBar