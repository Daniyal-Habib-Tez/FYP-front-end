import {
  successColor,
  whiteColor,
  grayColor,
  hexToRgb,
} from 'assets/jss/material-dashboard-react.js'

const dashboardStyle = {
  successText: {
    color: successColor[0],
  },
  upArrowCardCategory: {
    width: '16px',
    height: '16px',
  },

  trainBtn: {
    position: 'absolute',
    right: 22,
    top: 37,
    zIndex: 10,
  },
  dltBtn: {
    position: 'absolute',
    right: 22,
    bottom: 6,
    // zIndex: 10000000
  },
  stats: {
    color: grayColor[0],
    display: 'inline-flex',
    fontSize: '12px',
    lineHeight: '22px',
    '& svg': {
      top: '4px',
      width: '16px',
      height: '16px',
      position: 'relative',
      marginRight: '3px',
      marginLeft: '3px',
    },
    '& .fab,& .fas,& .far,& .fal,& .material-icons': {
      top: '4px',
      fontSize: '16px',
      position: 'relative',
      marginRight: '3px',
      marginLeft: '3px',
    },
  },
  cardCategory: {
    color: grayColor[0],
    margin: '0',
    fontSize: '14px',
    marginTop: '0',
    // paddingTop: "10px",
    marginBottom: '0',
  },
  cardCategoryList: {
    margin: 0,
    listStyleType: 'none',
    paddingLeft: 0,
  },
  cardCategoryWhite: {
    color: 'rgba(' + hexToRgb(whiteColor) + ',.62)',
    margin: '0',
    fontSize: '14px',
    marginTop: '0',
    marginBottom: '0',
  },
  cardTitle: {
    color: grayColor[2],
    marginTop: '0px',
    minHeight: 'auto',
    fontWeight: '300',
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: '3px',
    textDecoration: 'none',
    '& small': {
      color: grayColor[1],
      fontWeight: '400',
      lineHeight: '1',
    },
  },
  cardTitleWhite: {
    color: whiteColor,
    marginTop: '0px',
    minHeight: 'auto',
    fontWeight: '300',
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: '3px',
    textDecoration: 'none',
    '& small': {
      color: grayColor[1],
      fontWeight: '400',
      lineHeight: '1',
    },
  },
  media: {
    height: 140,
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    backgroundColor: '#fff',
    padding: '0 20px 20px',
    borderRadius: 5,
    minWidth: 600,
  },
  pageName: {
    position: 'absolute',
    top: 6,
    left: 46,
    fontSize: 20,
    fontWeight: '500',
  },
}

export default dashboardStyle
