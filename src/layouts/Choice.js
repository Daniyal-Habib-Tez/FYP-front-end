import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import AddIcon from '@material-ui/icons/Add'
import CardBody from 'components/Card/CardBody'
import GridItem from 'components/Grid/GridItem.js'
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

const useStyles = makeStyles(styles)

const Choice = () => {
  const history = useHistory()

  const [pictures, setPictures] = useState([])
  const [predicting, setPredicting] = useState(false)
  const [loader, setLoader] = useState(true)
  const [columnList, setColumnList] = useState([])
  const [algorithms, setAlgorithm] = useState([])
  const [prediction, setPrediction] = useState()
  const [open, setOpen] = useState(false)
  const [openProject, setOpenProject] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [openTimeSeries, setTimeSeries] = useState(false)
  const [openCluster, setCluster] = useState(false)
  const [project, setProject] = useState({})
  const [projectName, setProjectName] = useState('')
  const [categories, setCategories] = useState(['', ''])
  const [selectedFile, setSelectedFile] = useState(null)
  const [labelsArray, setLabelsArray] = useState([])
  const [targetsArray, setTargetsArray] = useState([])
  const [targetSel, setTargetSel] = useState('')
  const [selectedLabelsArray, setSelectedLabelsArray] = useState([])
  const [result, setResult] = useState([])
  const [algoSelected, setAlgoSel] = useState([])
  const [colValue, setColValue] = useState([])

  const [msg, setMsg] = useState({
    content: '',
    type: '',
  })

  const fileUploader = (e) => {
    console.log('file uploader input', e.target.files[0])
    setSelectedFile(e.target.files)
  }

  const targetS = (e) => {
    console.log('target selected item', e.target.value, typeof e.target.value)
    setTargetSel(e.target.value)
  }
  const algoSel = (e) => {
    console.log('algo selected ', e.target.value, typeof e.target.value)
    setAlgoSel(e.target.value)
  }
  const colVal = (e, index) => {
    console.log('col k andar ka string', e.target.value, index)
    setColValue(e.target.value, index)
  }

  useEffect(() => {
    console.log('hello', targetSel)
  }, [targetSel])
  const handleOpenModal = () => {
    setOpenModal(true)
  }
  const handleOpenTime = () => {
    setTimeSeries(true)
  }
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

  let errorMsg = ''

  const readFile = (e) => {
    e.preventDefault()
    if (!selectedFile[0]) {
      errorMsg = 'Please select a file first'
    } else {
      errorMsg = ''
      var reader = new FileReader()
      reader.readAsText(selectedFile[0])
      reader.onload = () => {
        extractHeader(reader)
      }
    }
  }
  const extractHeader = (reader) => {
    let labels = []
    let targets = []
    const lines = reader.result.split('\n').map((line) => line.split(','))
    lines[0].forEach((item) => {
      labels.push({
        name: item,
        value: item + '1',
      })
      targets.push({
        name: item,
        value: item,
      })
    })
    setLabelsArray(labels)
    setTargetsArray(targets)
  }
  const labelSelect = (item) => {
    console.log('chlrha yahan tk')
    let selectedArray = selectedLabelsArray
    let target = []
    let tar = []
    console.log('selectedarray', selectedArray)
    if (!selectedArray.includes(item.name)) {
      console.log('not present')
      selectedArray.push(item.name.trim())
      target = targetsArray.filter((obj) => obj.name !== item.name)
      setTargetsArray(target)
      if (item.name === tar) {
        tar = ''
      }
    } else {
      console.log('present')
      selectedArray.splice(selectedArray.indexOf(item.name), 1)
      target = targetsArray
      target.push({
        name: item.name,
        value: item.name,
      })
      console.log('splice', target)
      setTargetsArray(target)
    }
    console.log('yh hai targets array', targetsArray)
    setTargetSel(tar)
    setSelectedLabelsArray(selectedArray)

    console.log(
      'selectedArray, target, selected target',
      selectedArray,
      target,
      targetSel
    )
  }
  const submitForm = async (e) => {
    e.preventDefault()
    console.log('clicked')
    console.log(selectedFile, selectedLabelsArray, targetSel, typeof targetSel)
    let formData = new FormData()
    formData.append('file', selectedFile[0])
    formData.append(
      'json',
      JSON.stringify({
        drop: selectedLabelsArray,
        target: targetSel.trim(),
      })
    )
    formData.forEach((abc) => console.log(abc))
    fetch('http://localhost:8000/api/data_reg', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((result) => {
        console.log('agaya response ', result)
        setResult(result)
        getAlgosreg(result)
        console.log('alogsWalaFunction')
      })
      .catch((err) => {
        console.log('error', err)

        setMsg({
          content: err.message,
          type: 'error',
        })
      })
  }
  const getAlgosreg = (response) => {
    let columnList = []
    let algorithmList = []

    console.log(response)
    setLoader(false)
    columnList = response['column_name']
    delete response['column_name']
    for (let algo in response) {
      algorithmList.push({
        name: algo,
        success: response[algo][0],
        error: response[algo][1],
      })
    }
    console.log('columnList', columnList)
    console.log('algoList', algorithmList)
    setColumnList(columnList)
    setAlgorithm(algorithmList)
  }
  const predictReg = () => {
    console.log('prediction start')
    let model = algoSelected
    if (!model) {
      setMsg({
        content: 'Please select a model first',
        type: 'error',
      })
    } else {
      let columns = {}
      let i = 0
      for (let c of columnList) {
        columns[c] = isNaN(colValue[i]) ? colValue[i] : parseFloat(colValue[i])
        i++
      }
      for (let co in columns) {
        if (columns[co] === undefined || columns[co] === '') {
          setMsg({
            content: 'All Input Parameters are required.',
            type: 'error',
          })
          return
        }
      }

      let data = {
        model,
        columns,
      }
      fetch('http://localhost:8000/api/prediction', {
        method: 'POST',
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((result) => {
          console.log('agaya response ', result)
          setResult(result)
          console.log('Prediction wala function')
        })
        .catch((err) => {
          console.log('error', err)

          setMsg({
            content: err.message,
            type: 'error',
          })
        })
    }
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
        <p className={classes.pagename}> Category Predictor </p>
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
              <AddIcon style={{ fontSize: 80 }} />
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
            // onClick={() => history.push('/admin/dashboard')}
            onClick={handleOpenModal}
          >
            <CardBody
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <AddIcon style={{ fontSize: 80 }} />
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
            onClick={handleOpenTime}
          >
            <CardBody
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <AddIcon style={{ fontSize: 80 }} />
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
            onClick={handleOpenCluster}
          >
            <CardBody
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <AddIcon style={{ fontSize: 80 }} />
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
        open={openModal}
        onClose={handleCloseProject}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={openModal}>
          <Box
            boxShadow={3}
            className={classes.paper}
            style={{ maxHeight: '65vh', overflow: 'auto' }}
          >
            <h2 id='transition-modal-title'>Enter a CSV OR XLSX</h2>
            <Grid item xs={12}>
              <Card style={{ marginBottom: 0, cursor: 'pointer' }}>
                <section className='container'>
                  <form onSubmit={readFile} className='file-upload'>
                    <input
                      type='file'
                      label='Select a CSV file'
                      onChange={(e) => fileUploader(e)}
                    ></input>
                    <Button
                      type='submit'
                      fullWidth
                      variant='contained'
                      color='primary'
                      style={{ marginTop: '9px' }}
                      disabled={selectedFile <= 0}
                    >
                      {predicting ? <CircularProgress size={24} /> : 'Upload'}
                    </Button>
                  </form>
                </section>
                {labelsArray.length > 0 ? (
                  <section>
                    <h2>Drop Label</h2>
                    <div style={{ overflow: 'auto' }}>
                      {labelsArray.map((plan) => (
                        <div style={{ display: 'flex' }}>
                          <input
                            type='checkbox'
                            id={plan.value}
                            onChange={() => labelSelect(plan)}
                          />
                          <label
                            htmlFor={plan.value}
                            style={{
                              fontWeight: 'bold',
                              marginLeft: '5px',
                              fontSize: '15px',
                            }}
                          >
                            {plan.name}
                          </label>
                        </div>
                      ))}
                      <section>
                        <h2>Target Selection</h2>
                        <div style={{ overflow: 'auto' }}>
                          {targetsArray.map((tx) => (
                            <div style={{ display: 'flex' }}>
                              <input
                                type='radio'
                                name='target'
                                id={tx.value}
                                value={tx.value}
                                onChange={(e) => targetS(e)}
                              />
                              <label
                                htmlFor={tx.value}
                                style={{
                                  fontWeight: 'bold',
                                  marginLeft: '5px',
                                  fontSize: '15px',
                                }}
                              >
                                {tx.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>
                    <Button
                      type='submit'
                      fullWidth
                      variant='contained'
                      color='primary'
                      style={{ marginTop: '9px' }}
                      disabled={targetSel <= 0}
                      onClick={submitForm}
                    >
                      {predicting ? <CircularProgress size={24} /> : 'Next'}
                    </Button>
                  </section>
                ) : null}
                {algorithms.length > 0 ? (
                  <section>
                    <h2>Select Algorithm :</h2>
                    <div style={{ overflow: 'auto' }}>
                      {algorithms.map((alg) => (
                        <div style={{ display: 'flex' }}>
                          <input
                            type='radio'
                            name='target'
                            id={alg.name}
                            value={alg.name}
                            onChange={(e) => algoSel(e)}
                          />
                          <label
                            htmlFor={alg.name}
                            style={{
                              fontWeight: 'bold',
                              marginLeft: '5px',
                              fontSize: '15px',
                            }}
                          >
                            {alg.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    <section>
                      <h2>Input Parameters : </h2>
                      <p>
                        When entering a number please insert (0-9) numbers only
                        :
                      </p>
                      <div style={{ display: 'flex', overflow: 'auto' }}>
                        {columnList.map((col, index) => (
                          <input
                            type='string'
                            placeholder={col}
                            onChange={(value) => colVal(value, index)}
                          ></input>
                        ))}
                      </div>
                    </section>
                    <Button
                      type='submit'
                      fullWidth
                      variant='contained'
                      color='primary'
                      style={{ marginTop: '9px' }}
                      disabled={colValue <= 0}
                      onClick={predictReg}
                    >
                      {predicting ? <CircularProgress size={24} /> : 'Predict'}
                    </Button>
                  </section>
                ) : null}
              </Card>
            </Grid>
          </Box>
        </Fade>
      </Modal>
      <Modal
        aria-labelledby='transition-modal-title'
        aria-describedby='transition-modal-description'
        className={classes.modal}
        open={openTimeSeries}
        onClose={handleCloseProject}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={openTimeSeries}>
          <Box
            boxShadow={3}
            className={classes.paper}
            style={{ maxHeight: '65vh', overflowY: 'auto' }}
          >
            <h2 id='transition-modal-title'>Enter a CSV or XLSX</h2>
            <Grid item xs={12}>
              <Card style={{ marginBottom: 0, cursor: 'pointer' }}>
                <section className='container'>
                  <form onSubmit={readFile} className='file-upload'>
                    <input
                      type='file'
                      label='Select a CSV file'
                      onChange={(e) => fileUploader(e)}
                    ></input>
                    <Button
                      type='submit'
                      fullWidth
                      variant='contained'
                      color='primary'
                      style={{ marginTop: '9px' }}
                      disabled={selectedFile <= 0}
                    >
                      {'Upload'}
                    </Button>
                  </form>
                </section>
                {labelsArray.length > 0 ? (
                  <section>
                    <h2>Drop Label</h2>
                    <div style={{ overflow: 'auto' }}>
                      {labelsArray.map((plan) => (
                        <div style={{ display: 'flex' }}>
                          <input
                            type='checkbox'
                            id={plan.value}
                            onChange={() => labelSelect(plan)}
                          />
                          <label
                            htmlFor={plan.value}
                            style={{
                              fontWeight: 'bold',
                              marginLeft: '5px',
                              fontSize: '15px',
                            }}
                          >
                            {plan.name}
                          </label>
                        </div>
                      ))}
                      <section>
                        <h2>Target Selection</h2>
                        <div style={{ overflow: 'auto' }}>
                          {targetsArray.map((tx) => (
                            <div style={{ display: 'flex' }}>
                              <input
                                type='radio'
                                name='target'
                                id='tx.value'
                                value={tx.value}
                                onChange={(e) => targetS(e)}
                              />
                              <label
                                for='tx.value'
                                style={{
                                  fontWeight: 'bold',
                                  marginLeft: '5px',
                                  fontSize: '15px',
                                }}
                              >
                                {tx.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>
                  </section>
                ) : null}
              </Card>
            </Grid>
          </Box>
        </Fade>
      </Modal>
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
