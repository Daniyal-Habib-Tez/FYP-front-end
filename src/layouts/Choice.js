import React, { useState, useEffect, useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import AddIcon from '@material-ui/icons/Add'
import CardBody from 'components/Card/CardBody'
import GridItem from 'components/Grid/GridItem.js'
import DeleteIcon from '@material-ui/icons/Delete'
import ImageUploader from 'react-images-upload'

import {
  Backdrop,
  Box,
  CircularProgress,
  Container,
  Fade,
  IconButton,
  Modal,
  TextField,
} from '@material-ui/core'
import { useHistory } from 'react-router'
import styles from 'assets/jss/material-dashboard-react/views/dashboardStyle.js'
import { IndeterminateCheckBoxOutlined } from '@material-ui/icons'
import { createFalse } from 'typescript'
import Dropzone, { useDropzone } from 'react-dropzone'

const useStyles = makeStyles(styles)

const Choice = () => {
  const history = useHistory()
  const [user, setUser] = useState()
  const [projects, setProjects] = useState([])
  const [emptyProjects, setEmptyProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [pictures, setPictures] = useState([])
  const [predicting, setPredicting] = useState(false)
  const [prediction, setPrediction] = useState()
  const [open, setOpen] = useState(false)
  const [openProject, setOpenProject] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [openTimeSeries, setTimeSeries] = useState(false)

  const [openCluster, setCluster] = useState(false)
  const [project, setProject] = useState({})
  const [projectName, setProjectName] = useState('')
  const [categories, setCategories] = useState(['', ''])
  const [file, setFile] = useState([])
  const [msg, setMsg] = useState({
    content: '',
    type: '',
  })

  useEffect(() => {
    const userData = localStorage.getItem('user')
    setUser(JSON.parse(userData))
    getProjects()
    if (JSON.parse(userData).isAdmin) {
      getEmptyProjects()
    }
  }, [])

  const handleOpen = (project) => {
    setProject(project)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setProject({})
    setPictures([])
    setPrediction()
    setPredicting(false)
  }

  const handleOpenProject = () => {
    setOpenProject(true)
  }
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

  const getProjects = () => {
    setLoading(true)
    fetch('http://localhost:5000/api/get_Projects')
      .then((res) => res.json())
      .then((res) => {
        setLoading(false)
        if (res.status == 200) {
          console.log('data', res)
          setProjects(res.projects)
          setMsg({
            content: res.message,
            type: 'success',
          })
        } else {
          throw new Error(res.message)
        }
      })
      .catch((err) => {
        setLoading(false)
        setMsg({
          content: err.message,
          type: 'error',
        })
      })
  }

  const getEmptyProjects = () => {
    setLoading(true)
    fetch('http://localhost:5000/api/get_empty_Projects')
      .then((res) => res.json())
      .then((res) => {
        setLoading(false)
        if (res.status == 200) {
          console.log('empty data', res)
          setEmptyProjects(res.missing_data_projects)
          setMsg({
            content: res.message,
            type: 'success',
          })
        } else {
          throw new Error(res.message)
        }
      })
      .catch((err) => {
        setLoading(false)
        setMsg({
          content: err.message,
          type: 'error',
        })
      })
  }

  const onChange = (e) => {
    if (e.target.name === 'projectName') {
      setProjectName(e.target.value)
    }
    // else if (e.target.name === 'categoryOne') {
    //   const newArr = categories
    //   newArr[0] = e.target.value
    //   setCategories(newArr)
    // } else if (e.target.name === 'categoryTwo') {
    //   const newArr = categories
    //   newArr[1] = e.target.value
    //   setCategories(newArr)
    // }
  }
  const onChangeClass = (e, index) => {
    console.log(e.target.value, index)
    const newArr = categories
    newArr[index] = e.target.value
    setCategories(newArr)
  }

  const onDelete = (index) => {
    const newArr = [...categories]
    newArr.splice(index, 1)
    setCategories(newArr)
  }

  const createProject = () => {
    console.log('categories', projectName, categories.sort())

    fetch('http://localhost:5000/api/create_multiclass_project', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_name: projectName,
        project_class_list: categories.sort(),
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log('response', res)
        if (res.status == 200) {
          setPredicting(false)
          history.push({
            pathname: '/admin/project',
            state: {
              project_name: projectName,
              categories: categories
                .sort()
                .map((cat) => ({ category_name: cat, status: false })),
            },
          })
          setMsg({
            content: res.message,
            type: 'success',
          })
        } else {
          throw new Error(res.message)
        }
      })
      .catch((err) => {
        setPredicting(false)
        console.log('error', err)

        setMsg({
          content: err.message,
          type: 'error',
        })
      })
  }
  let uploadedFiles = []
  let errorMsg = ''

  const readFile = () => {
    if (!uploadedFiles[0]) {
      errorMsg = 'Please select a file first'
    } else {
      errorMsg = ''
      var reader = new FileReader()
      reader.readAsText(uploadedFiles[0])
      reader.onload = () => {
        // extractHeader(reader)
      }
    }
  }
  // const extractHeader = (reader) => {
  //   labelsArray = []
  //   targetsArray = []

  //   const lines = reader.result.split('\n').map((line) => line.split(','))
  //   lines[0].forEach((item) => {
  //     labelsArray.push({
  //       name: item,
  //       value: item + '1',
  //     })
  //     targetsArray.push({
  //       name: item,
  //       value: item,
  //     })
  //   })
  // }
  const onDrop = (acceptedFiles) => {
    console.log(acceptedFiles)
  }
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  })

  const classes = useStyles()
  const bull = <span className={classes.bullet}>•</span>
  return (
    <div className='choice'>
      <Container
        maxWidth='lg'
        component='div'
        style={{ display: 'flex', flexWrap: 'wrap' }}
      ></Container>
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
            // onClick={() => history.push("/admin/project")}
            onClick={handleOpenProject}
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
            //onClick={() => history.push('/admin/dashboard')}
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
        open={openProject}
        onClose={handleCloseProject}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={openProject}>
          <Box
            boxShadow={3}
            className={classes.paper}
            style={{ maxHeight: '65vh', overflowY: 'auto' }}
          >
            <h2 id='transition-modal-title'>Create Project</h2>
            <Grid container spacing={2} style={{ marginBottom: 10 }}>
              <Grid item xs={12}>
                <TextField
                  label='Project Name'
                  variant='outlined'
                  style={{ width: '100%' }}
                  name='projectName'
                  onChange={onChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={`Class 1`}
                  variant='outlined'
                  style={{ width: '100%' }}
                  name={`category1`}
                  onChange={(val) => onChangeClass(val, 0)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={`Class 2`}
                  variant='outlined'
                  style={{ width: '100%' }}
                  name={`category2`}
                  onChange={(val) => onChangeClass(val, 1)}
                />
              </Grid>
              {categories &&
                categories.map((cat, ind) => {
                  return ind < 2 ? null : ind === categories.length - 1 ? (
                    <>
                      <Grid item xs={10}>
                        <TextField
                          label={`Class ${ind + 1}`}
                          variant='outlined'
                          style={{ width: '100%' }}
                          name={`category${ind + 1}`}
                          onChange={(val) => onChangeClass(val, ind)}
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <Button
                          type='button'
                          fullWidth
                          variant='contained'
                          color='danger'
                          onClick={() => onDelete(ind)}
                          // disabled={
                          //   projectName.length == 0 ||
                          //   categories[0] === "" ||
                          //   categories[1] === "" ||
                          //   predicting
                          // }
                        >
                          <DeleteIcon />
                        </Button>
                      </Grid>
                    </>
                  ) : (
                    <Grid item xs={12}>
                      <TextField
                        label={`Class ${ind + 1}`}
                        variant='outlined'
                        style={{ width: '100%' }}
                        name={`category${ind + 1}`}
                        onChange={(val) => onChangeClass(val, ind)}
                      />
                    </Grid>
                  )
                })}
              <Grid item xs={6}>
                <Button
                  type='button'
                  fullWidth
                  variant='contained'
                  color='primary'
                  onClick={() => {
                    setCategories([...categories, ''])
                  }}
                  // disabled={
                  //   projectName.length == 0 ||
                  //   categories[0] === "" ||
                  //   categories[1] === "" ||
                  //   predicting
                  // }
                >
                  {predicting ? <CircularProgress size={24} /> : 'Add Class'}
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  type='button'
                  fullWidth
                  variant='contained'
                  color='primary'
                  onClick={createProject}
                  // disabled={
                  //   projectName.length == 0 ||
                  //   categories[0] === "" ||
                  //   categories[1] === "" ||
                  //   predicting
                  // }
                >
                  {predicting ? <CircularProgress size={24} /> : 'Create'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      </Modal>
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
            style={{ maxHeight: '65vh', overflowY: 'auto' }}
          >
            <h2 id='transition-modal-title'>Enter a CSV OR XLSX</h2>
            <Grid item xs={12}>
              <Card style={{ marginBottom: 0, cursor: 'pointer' }}>
                <section className='container'>
                  <Dropzone
                    maxFiles={1}
                    onDrop={(acceptedFiles) => onDrop(acceptedFiles)}
                  >
                    {({ getRootProps, getInputProps }) => (
                      <section style={{ border: 'solid', marginBottom: '5px' }}>
                        <div {...getRootProps()}>
                          <input {...getInputProps()} />
                          <p>
                            Drag 'n' drop some files here, or click to select
                            files
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
              onClick={readFile}
            >
              {predicting ? <CircularProgress size={24} /> : 'Upload'}
            </Button>
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
                  <Dropzone
                    maxFiles={1}
                    onDrop={(acceptedFiles) => onDrop(acceptedFiles)}
                  >
                    {({ getRootProps, getInputProps }) => (
                      <section style={{ border: 'solid', marginBottom: '5px' }}>
                        <div {...getRootProps()}>
                          <input {...getInputProps()} />
                          <p>
                            Drag 'n' drop some files here, or click to select
                            files
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
                  <Dropzone
                    maxFiles={1}
                    onDrop={(acceptedFiles) => onDrop(acceptedFiles)}
                  >
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
