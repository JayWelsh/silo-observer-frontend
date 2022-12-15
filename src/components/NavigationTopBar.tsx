import React, { useState, useEffect } from 'react';

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

  useEffect(() => {
    // setLocalShowLeftMenu(props.showLeftMenu)
  }, [props.showLeftMenu])

  useEffect(() => {
    setLocalDarkMode(props.darkMode)
  }, [props.darkMode])

  return (
    <div className={classes.root}>
      <AppBar style={{background: 'linear-gradient(-90deg, #000000, #000000)'}} position="static">
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
          <img onClick={() => navigate('/')} height={'40px'} style={{cursor: 'pointer'}} src={localDarkMode ? LogoDarkMode : LogoLightMode} className={[classes.logoSpacer].join(' ')} alt="logo" />
          {!isConsideredMobile &&
            <Typography onClick={() => navigate('/')} variant="h6" className={classes.title}>
              silo.observer
            </Typography>
          }
          <div className={classes.flexer}/>
          <div className={"flex-center-all"}>
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
      <GithubRepoNavigatorDialog open={showGithubNavigation} onClose={() => setShowGithubNavigation(false)}/>
    </div>
  );
}

export default NavigationTopBar