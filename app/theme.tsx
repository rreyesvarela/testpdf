'use cliente'

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#f94e01',
    },
    secondary: {
      main: '#782d30',
    },
  },
  typography: {
    h1: {
      fontSize: '36px',
      fontStyle: 'normal',
      lineHeight: 'normal',
      fontWeight: 400,
      color: '#7f7f7f',
    },
    h2: {
      fontSize: '28px',
      fontStyle: 'normal',
      lineHeight: 'normal',
      fontWeight: 400,
      color: '#d50411',
    },
    h3: {
      fontSize: '20px',
      fontStyle: 'normal',
      lineHeight: 'normal',
      color: '#7f7f7f',
    },
    h4: {
      fontSize: '12px',
      fontStyle: 'normal',
      lineHeight: 'normal',
      color: '#7f7f7f',
    },
    h6: {
      fontSize: '24px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: 'normal',
    },
    body1: {
      fontSize: '20px',
      fontStyle: 'normal',
      fontWeight: 300,
      lineHeight: 'normal',
      color: '#f94e01',
    },
    subtitle1: {
      fontSize: '15px',
      fontStyle: 'normal',
      lineHeight: 'normal',
    },
    body2: {
      fontSize: '25px',
      fontStyle: 'normal',
      lineHeight: 'normal',
      color: "white"
    },
    subtitle2: {
      fontSize: '14px',
      fontStyle: 'normal',
      lineHeight: 'normal',
      color: '#FFF'
    },
  },
});

export default theme;