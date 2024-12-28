import React, { useLayoutEffect } from 'react';

// import { HashRouter } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';

import { createTheme, StyledEngineProvider, Theme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import '../styles/App.scss';
import { PropsFromRedux } from '../containers/AppContainer';

import PageContainer from './PageContainer';

import { useWindowSize } from '../hooks'
declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

const App = (props: PropsFromRedux) => {

  const { setConsideredMobile } = props;

  const windowSize = useWindowSize();

  useLayoutEffect(() => {
    let sizeConsiderMobile = 680;
    if (windowSize.width && (windowSize.width <= sizeConsiderMobile)) {
      setConsideredMobile(true);
    }else{
      setConsideredMobile(false);
    }
  }, [windowSize.width, windowSize.height, setConsideredMobile])

  const theme = React.useMemo(
    () =>
      createTheme({
        breakpoints: {
          values: {
            xs: 0,
            sm: 600,
            md: 900,
            lg: 1200,
            xl: 1420,
          },
        },
        shape: {
          borderRadius: 8
        },
        palette: {
          mode: props.darkMode ? 'dark' : 'light',
          primary: {
            main: '#FFF',
          },
          ...(props.darkMode && {
            background: {
              default: "#131313",
              paper: "#000000"
            }
          })
        },
        components: {
          MuiCard :{
            styleOverrides: {
              root:{
                border: "1px solid #ffffff3b"
              }
            }
          },
        }
      }),
    [props.darkMode],
  );

  return (
    <BrowserRouter>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <CssBaseline/>
            <PageContainer/>
          </ThemeProvider>
        </StyledEngineProvider>
    </BrowserRouter>
  );
}

export default App;
