import React from 'react'
import { Container } from '@material-ui/core'
import { useHistory } from 'react-router'
import { makeStyles } from '@material-ui/core/styles'

import styles from 'assets/jss/material-dashboard-react/views/dashboardStyle.js'

const useStyles = makeStyles(styles)

const Regression = () => {
  const history = useHistory()
  const classes = useStyles()

  return (
    <div className='regression'>
      <Container
        maxWidth='lg'
        component='div'
        style={{ display: 'flex', flexWrap: 'wrap' }}
      >
        <p
          style={{
            position: 'absolute',
            top: 6,
            right: 124,
            cursor: 'pointer',
            zIndex: 100000000,
          }}
          onClick={() => history.push('/admin')}
        >
          Home
        </p>
      </Container>
    </div>
  )
}

export default Regression
