import baseColors, { blue, green, yellow, red } from "./colors";
import { tint, shade } from 'polished';

// theme.js
export default {
  breakpoints: ['52em', '64em'],
  // breakpoints: ['40em', '52em', '64em', '80em'],
  fontSizes: [14, 16, 16, 20, 20, 28, 36, 48, 54, 64, 72, 84],
  fontWeights: [0, 300, 400, 600, 700, 800],
  letterSpacings: [0, 1, 2, 4, 8],
  lineHeights: {
    solid: 1,
    title: 1.25,
    copy: 1.4
  },
  fonts: {
    ctas: '"Open Sans"',
    labels: '"Open Sans"',
    titles: '"Open Sans"',
    sansSerif: '"Source Sans Pro"',
    counter: '"Roboto Mono", Arial, -apple-system, sans-serif'
  },
  space: [0, 4, 8, 16, 32, 64, 128, 256],
  radii: ['0', '5px', '8px', '16px', '2rem'],
  width: [0, 16, 32, 64, 128, 256],
  minWidths: [0, 16, 32, 64, 128, 256],
  maxWidths: [0, 16, 32, 64, 128, 256, 512, 768, 1024, 1536],
  heights: [0, 16, 32, 64, 128, 256],
  minHeights: [0, 16, 32, 64, 128, 256],
  maxHeights: [0, 16, 32, 64, 128, 256],
  borders: [0, '1px solid #C6CBD2', '1px solid #475d7c'],
  borderWidths: ['0', '1px', '2px', '4px'],
  shadows: [
    '0',
    '0px 2px 4px rgba(0, 0, 0, 0.1)',
    '0 7px 14px rgba(50,50,93,.1)',
    '1px 1px 0px rgba(0,0,0,0.2)',
    '0px 0px 16px 2px rgb(71,93,123,0.6)'
  ],
  opacity: {
    disabled: 0.4,
  },
  colors: {
    primary: '#FFFFFF',
    'gradient-bg': 'linear-gradient(120deg, #f6d365 0%, #ea0d73 100%)',
    'primary-light': blue.light[1],
    'primary-dark': blue.dark[1],
    bgBlue: '#0030e0',
    blue: '#0036ff',
    tick: "#00b84a",
    'dark-blue': '#00219a',
    skyBlue: '#00abfe',
    lightBlue: '#79f4e1',
    copyColor: '#CDD0D6',
    subColor: '#a7a7a7',
    black: baseColors.black,
    'near-black': '#1e3657',
    'dark-gray': '#FFFFFF',
    'mid-gray': '#999',
    gray: ' #e0e0e0',
    grey: '#CCC',
    silver: '#999',
    'light-silver': '#aaa',
    'moon-gray': '#ccc',
    'light-gray': '#eee',
    'near-white': '#CDD0D6',
    white: '#fff',
    transparent: 'transparent',
    green: '#00b84a',
    /*
    CTAs
    */
    ctaPrimaryText:'#1B1E27',
    ctas:{
      primary:{
        default:{
          border:'none',
          text:'#1B1E27',
          background:'#FFFFFF'
        },
        hover:{
          border:'none',
          text:'#FFFFFF',
          background:'#2272C8'
        }
      },
      secondary:{
        default:{
          text:'#FFFFFF',
          background:'#FFFFFF',
          border:'1px solid #FFFFFF'
        },
        hover:{
          text:'#FFFFFF',
          background:'#FFFFFF',
          border:'1px solid #FFFFFF'
        }
      }
    },
    /*
    NEW COLORS
    */
    text: "#C6CBD2",
    border: "#546278",
    newblue: "#2272C8",
    alert: '#ff9900',
    arrowActive: '#d8d8d8',
    arrowInactive: '#4f4f4f',
    selectBgFocused: '#293243',
    selectBg: '#293243',
    backButtonBg: '#FFFFFF',
    lineChartStroke: '#CDD0D6',
    wrongNetworkBannerBg: '#0e2133',
    dashboardBg: '#1B1E27',
    statValue: '#FFFFFF',
    boxBorder: '#eeeeee',
    cellTitle: '#CDD0D6',
    cellText: '#CDD0D6',
    divider: '#CDD0D6',
    counter: '#CDD0D6',
    redeem: '#00a9fe',
    link: '#FFFFFF',
    deposit: '#0239ff',
    migrate: '#00a9fe',
    legend: '#C6CBD2',
    cardBg: '#293243',
    menuBg: '#293243',
    menuHover: '#293243',
    dropdownBg: '#4C5976',
    flashBg: '#04117B',
    flashColor: '#eeeeee',
    cardBgHover: '#4b5a76',
    cardBorder: '#0d2034',
    pageActive: '#d8d8d8',
    pageInactive: '#4f4f4f',
    menuIconActive: '#2a65d9',
    // cardBgActive: "#04117B",
    // cardBgActive: "#0c48a4",
    cardBgActive: "#2272C8",
    cardBgContrast: "#293243",
    menuRightBorder: '#0d2034',
    experimental: "#8500ff",
    production: "#00b84a",
    cardHoverShadow: '0px 0px 0px 1px rgb(45 74 114)',
    transactions: {
      action: {
        send: '#10a0dd',
        swap: '#3d53c0',
        exit: '#10a0dd',
        boost: '#ffff00',
        redeem: '#10a0dd',
        swapout: '#10a0dd',
        deposit: '#3d53c0',
        curvein: '#10a0dd',
        receive: '#3d53c0',
        migrate: '#3d53c0',
        default: '#4f4f4f',
        curveout: '#3d53c0',
        withdraw: '#10a0dd',
        curvedepositin: '#10a0dd',
        curvedepositout: '#3d53c0'
      },
      actionBg: {
        send: '#ceeff6',
        swap: '#ced6ff',
        exit: '#ceeff6',
        boost: '#ff7979',
        redeem: '#ceeff6',
        swapout: '#ceeff6',
        deposit: '#ced6ff',
        curvein: '#ceeff6',
        default: '#dadada',
        receive: '#ced6ff',
        migrate: '#ced6ff',
        withdraw: '#ceeff6',
        curveout: '#ced6ff',
        curvedepositin: '#ceeff6',
        curvedepositout: '#ced6ff'
      },
      status: {
        completed: '#00b84a',
        pending: '#a5a5a5',
        failed: '#fa0000'
      }
    },
    blacks: [
      'rgba(0,0,0,.0125)',
      'rgba(0,0,0,.025)',
      'rgba(0,0,0,.05)',
      'rgba(0,0,0,.1)',
      'rgba(0,0,0,.2)',
      'rgba(0,0,0,.3)',
      'rgba(0,0,0,.4)',
      'rgba(0,0,0,.5)',
      'rgba(0,0,0,.6)',
      'rgba(0,0,0,.7)',
      'rgba(0,0,0,.8)',
      'rgba(0,0,0,.9)',
    ],
    whites: [
      'rgba(255,255,255,.0125)',
      'rgba(255,255,255,.025)',
      'rgba(255,255,255,.05)',
      'rgba(255,255,255,.1)',
      'rgba(255,255,255,.2)',
      'rgba(255,255,255,.3)',
      'rgba(255,255,255,.4)',
      'rgba(255,255,255,.5)',
      'rgba(255,255,255,.6)',
      'rgba(255,255,255,.7)',
      'rgba(255,255,255,.8)',
      'rgba(255,255,255,.9)',
    ],
  },
  zIndices: [0, 9, 99, 999, 9999],
  messageStyle: {
    base: {
      color: '#CDD0D6',
      borderColor: '#0d2034',
      backgroundColor: '#293243',
    },
    success: {
      color: shade(0.4, green.base),
      backgroundColor: tint(0.9, green.base),
      borderColor: green.base,
    },
    warning: {
      color: shade(0.4, yellow.base),
      backgroundColor: tint(0.9, yellow.base),
      borderColor: yellow.base,
    },
    danger: {
      color: shade(0.4, red.base),
      backgroundColor: tint(0.9, red.base),
      borderColor: red.base,
    },
    info: {
      color: '#CDD0D6',
      borderColor: '#0d2034',
      backgroundColor: '#293243',
    },
  },
  buttons: {
    primary: {
      color: '#1B1E27',
      backgroundColor: 'white',
      // use css custom props
      '--main-color': 'white',
      '--contrast-color': '#1B1E27',
    },
    normal: {
      color: '#1B1E27',
      backgroundColor: 'white',
      '--main-color': 'white',
      '--contrast-color': '#1B1E27',
    },
    success: {
      '--main-color': green.base,
      '--contrast-color': green.text,
    },
    danger: {
      '--main-color': red.base,
      '--contrast-color': red.text,
    },
  },
  buttonSizes: {
    small: {
      fontSize: '0.75rem',
      height: '2rem',
      minWidth: '2rem',
      padding: '0 1rem',
    },
    medium: {
      fontSize: '1rem',
      height: '3rem',
      minWidth: '3rem',
    },
    large: {
      fontSize: '1.5rem',
      height: '4rem',
      minWidth: '4rem',
      borderRadius: '2rem'
    },
  },
};
