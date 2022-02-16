import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import CardBody from 'components/Card/CardBody'
import GridItem from 'components/Grid/GridItem.js'
import Class from 'assets/img/classification.svg'
import Reg from 'assets/img/linear-regression.svg'
import Clus from 'assets/img/cluster.svg'
import Time from 'assets/img/sandclock.svg'
import {
  Backdrop,
  Box,
  CircularProgress,
  Container,
  Fade,
  Modal,
} from '@material-ui/core'
import { useHistory } from 'react-router'
import styles from 'assets/jss/material-dashboard-react/views/dashboardStyle.js'
import Dropzone, { useDropzone } from 'react-dropzone'
import { useEffect } from 'react'
import TimerIcon from '@material-ui/icons/Timer'

const useStyles = makeStyles(styles)

const Choice = () => {
  const history = useHistory()

  const [pictures, setPictures] = useState([])
  const [predicting, setPredicting] = useState(false)

  const [open, setOpen] = useState(false)
  const [openProject, setOpenProject] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [openTimeSeries, setTimeSeries] = useState(false)
  const [openCluster, setCluster] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [categories, setCategories] = useState(['', ''])

  const handleOpenCluster = () => {
    setCluster(true)
  }

  const handleCloseProject = () => {
    setOpenProject(false)
    setPredicting(false)
    setProjectName('')
    setCategories('')
    setOpenModal(false)
    setTimeSeries(false)
    setCluster(false)
  }
  const onDrop = (acceptedFiles) => {
    console.log(acceptedFiles)
  }
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  })

  const classes = useStyles()
  return (
    <div className='choice'>
      <Container
        maxWidth='lg'
        component='div'
        style={{ display: 'flex', flexWrap: 'wrap' }}
      >
        {/* <GridContainer> */}
        <p className={classes.pagename} style={{ fontSize: '20px' }}>
          {' '}
          Predict Tool{' '}
        </p>
      </Container>
      <Button
        style={{ position: 'absolute', top: 8, right: 124 }}
        color={'transparent'}
        justIcon={false}
        simple={false}
        aria-label='Dashboard'
        className={classes.buttonLink}
        onClick={() => {
          localStorage.removeItem('user')
          history.push('/auth/signin')
        }}
      >
        Logout
      </Button>
      <Grid
        style={{
          height: '100vh',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '-35px',
        }}
        container
        spacing={2}
      >
        <GridItem xs={12} sm={6} md={4} lg={3}>
          <Card
            style={{
              marginBottom: 0,
              minHeight: 167.333,
              height: 'calc(100% - 30px)',
              cursor: 'pointer',
            }}
            onClick={() => history.push('/admin/dashboard')}
            //onClick={handleOpenProject}
          >
            <CardBody
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <img src={Class} style={{ maxHeight: '80px' }}></img>
            </CardBody>
            <CardActions>
              <Button size='small' justifyContent='center'>
                Classification
              </Button>
            </CardActions>
          </Card>
        </GridItem>
        <GridItem xs={12} sm={6} md={4} lg={3}>
          <Card
            style={{
              marginBottom: 0,
              minHeight: 167.333,
              height: 'calc(100% - 30px)',
              cursor: 'pointer',
            }}
            onClick={() => history.push('/regression')}
            //onClick={handleOpenModal}
          >
            <CardBody
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <img src={Reg} style={{ maxHeight: '80px' }}></img>
            </CardBody>
            <CardActions>
              <Button size='small'>Regression</Button>
            </CardActions>
          </Card>
        </GridItem>
        <GridItem xs={12} sm={6} md={4} lg={3}>
          <Card
            style={{
              marginBottom: 0,
              minHeight: 167.333,
              height: 'calc(100% - 30px)',
              cursor: 'pointer',
            }}
            onClick={() => history.push('/timeseries')}
            //onClick={handleOpenTime}
          >
            <CardBody
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <img src={Time} style={{ maxHeight: '80px' }}></img>
            </CardBody>
            <CardActions>
              <Button size='small'> Time Series</Button>
            </CardActions>
          </Card>
        </GridItem>
        <GridItem xs={12} sm={6} md={4} lg={3}>
          <Card
            style={{
              marginBottom: 0,
              minHeight: 167.333,
              height: 'calc(100% - 30px)',
              cursor: 'pointer',
            }}
            // onClick={handleOpenCluster}
            onClick={() => history.push('/clustering')}
          >
            <CardBody
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <img src={Clus} style={{ maxHeight: '80px' }}></img>
            </CardBody>
            <CardActions>
              <Button size='small'>
                <span> Clustering</span>
              </Button>
            </CardActions>
          </Card>
        </GridItem>
      </Grid>

      <Modal
        aria-labelledby='transition-modal-title'
        aria-describedby='transition-modal-description'
        className={classes.modal}
        open={openCluster}
        onClose={handleCloseProject}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={openCluster}>
          <Box
            boxShadow={3}
            className={classes.paper}
            style={{ maxHeight: '65vh', overflowY: 'auto' }}
          >
            <h2 id='transition-modal-title'>
              Enter multiple images for clusterring
            </h2>
            <Grid item xs={12}>
              <Card style={{ marginBottom: 0, cursor: 'pointer' }}>
                <section className='container'>
                  <Dropzone onDrop={(acceptedFiles) => onDrop(acceptedFiles)}>
                    {({ getRootProps, getInputProps }) => (
                      <section style={{ border: 'solid', marginBottom: '5px' }}>
                        <div {...getRootProps()}>
                          <input {...getInputProps()} />
                          <p>
                            Drag 'n' drop some images here, or click to select
                            images
                          </p>
                        </div>
                      </section>
                    )}
                  </Dropzone>
                </section>
              </Card>
            </Grid>
            <Button
              type='button'
              fullWidth
              variant='contained'
              color='primary'
              //onClick={}
            >
              {predicting ? <CircularProgress size={24} /> : 'Upload'}
            </Button>
          </Box>
        </Fade>
      </Modal>
    </div>
  )
}

export default Choice
