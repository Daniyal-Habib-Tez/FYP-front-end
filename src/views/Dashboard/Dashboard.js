import React, { useEffect, useState } from 'react'
// @material-ui/core
import { makeStyles } from '@material-ui/core/styles'
// core components
import GridItem from 'components/Grid/GridItem.js'
import Card from 'components/Card/Card.js'
import CardHeader from 'components/Card/CardHeader.js'
import ImageUploader from 'react-images-upload'

import AddIcon from '@material-ui/icons/Add'
import DeleteIcon from '@material-ui/icons/Delete'
import TranslateIcon from '@material-ui/icons/Translate'
import TrainIcon from '@material-ui/icons/Train'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import styles from 'assets/jss/material-dashboard-react/views/dashboardStyle.js'
import {
  Backdrop,
  Box,
  Button,
  CardActions,
  CircularProgress,
  Container,
  Fade,
  Grid,
  IconButton,
  Modal,
  TextField,
} from '@material-ui/core'
import CardBody from 'components/Card/CardBody'
import { useHistory } from 'react-router-dom'

const useStyles = makeStyles(styles)

export default function Dashboard() {
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
  const [project, setProject] = useState({})
  const [projectName, setProjectName] = useState('')
  const [categories, setCategories] = useState(['', ''])
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

  const handleCloseProject = () => {
    setOpenProject(false)
    setPredicting(false)
    setProjectName('')
    setCategories('')
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

  const deleteProject = (project) => {
    fetch('http://localhost:5000/api/delete_project', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_name: project,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.status == 200) {
          getProjects()
          if (user.isAdmin) {
            getEmptyProjects()
          }
          setMsg({
            content: res.message,
            type: 'success',
          })
        } else {
          throw new Error(res.message)
        }
      })
      .catch((err) => {
        setMsg({
          content: err.message,
          type: 'error',
        })
      })
  }
  const shouldTrain = (project) => {
    let flag = true
    // let cats = project?.categories.map((cat) => cat.status)
    for (let cat of project?.categories) {
      if (!cat.status) flag = false
    }
    return flag
  }

  const trainProject = (project) => {
    // let cats = [
    //   project?.categories[0].category_name,
    //   project?.categories[1].category_name,
    // ]
    let cats = project?.categories.map((cat) => cat.category_name)
    console.log('cats', cats)

    // for (let category of project?.categories) {
    //   cats.push(category.category_name)
    //   console.log('cats', cats)
    //   return cats
    // }

    setLoading(true)
    fetch('http://localhost:5000/api/train', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_name: project.project_name,
        project_class_list: cats.sort(),
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        setLoading(false)
        if (res.status == 200) {
          getProjects()
          getEmptyProjects()
          setMsg({
            content: res.message,
            type: 'success',
          })
        } else {
          throw new Error(res.message)
        }
      })
      .catch((err) => {
        setMsg({
          content: err.message,
          type: 'error',
        })
      })
  }

  const onDrop = (picture) => {
    setPictures(picture)
  }

  const upload = () => {
    setPredicting(true)
    const URL = 'https://api.cloudinary.com/v1_1/n4beel/image/upload'
    const PRESET = 'c5lwhjac'
    const data = new FormData()

    data.append('file', pictures[0])
    data.append('upload_preset', PRESET)

    fetch(URL, {
      method: 'POST',
      body: data,
    })
      .then((response) => response.json())
      .then((result) => {
        console.log('Success:', result.url)
        predict(result.url)
      })
      .catch((err) => {
        setPredicting(false)
        console.log(err)
      })
  }

  const predict = (url) => {
    fetch('http://localhost:5000/api/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        project_name: project.project_name,
        project_class_list: project?.categories.sort(),
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log('response', res)
        if (res.status == 200) {
          setPredicting(false)
          setPrediction(res['Predicted Category'])
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

  const onChange = (e) => {
    if (e.target.name === 'projectName') {
      setProjectName(e.target.value)
    }
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

  const classes = useStyles()
  return (
    <div>
      {/* <GridContainer> */}
      <p className={classes.pageName}>Category Predictor</p>
      <Container maxWidth='lg' component='div'>
        <p
          style={{
            position: 'absolute',
            top: 6,
            right: 124,
            cursor: 'pointer',
            zIndex: 100000000,
          }}
          onClick={() => history.push('/choice')}
        >
          Back
        </p>
      </Container>
      <Container
        maxWidth='lg'
        component='div'
        style={{ display: 'flex', flexWrap: 'wrap' }}
      >
        {user?.isAdmin ? (
          <GridItem xs={12} sm={6} md={4} lg={3}>
            <Card
              style={{
                marginBottom: 0,
                minHeight: 167.333,
                height: 'calc(100% - 30px)',
                cursor: 'pointer',
              }}
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
            </Card>
          </GridItem>
        ) : null}
        {loading ? (
          <div style={{ width: '100%', textAlign: 'center' }}>
            {' '}
            <CircularProgress />
          </div>
        ) : projects?.length > 0 ? (
          projects.map((project, key) => (
            <GridItem
              style={{ position: 'relative' }}
              xs={12}
              sm={6}
              md={4}
              lg={3}
              key={key}
            >
              <Card
                style={{ marginBottom: 0, cursor: 'pointer' }}
                onClick={() => handleOpen(project)}
              >
                <CardHeader>
                  <h3 className={classes.cardTitle}>{project.project_name}</h3>
                </CardHeader>
                <CardBody>
                  <p className={classes.cardCategory}>Categories:</p>
                  <ul className={classes.cardCategoryList}>
                    {project?.categories.map((cat, key) => (
                      <li
                        className={classes.cardCategory}
                        key={key}
                        style={{ paddingLeft: 10 }}
                      >
                        {cat}
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
              {user?.isAdmin ? (
                <IconButton
                  aria-label='delete'
                  className={classes.dltBtn}
                  onClick={() => deleteProject(project.project_name)}
                >
                  <DeleteIcon />
                </IconButton>
              ) : null}
            </GridItem>
          ))
        ) : user?.isAdmin ? null : (
          <p style={{ width: '100%', textAlign: 'center' }}>
            {' '}
            No Projects Found{' '}
          </p>
        )}
      </Container>
      {user?.isAdmin && emptyProjects?.length > 0 ? (
        <>
          <Container maxWidth='lg' component='div' style={{ marginTop: 60 }}>
            <h4 style={{ paddingRight: 16, paddingLeft: 16, marginBottom: 0 }}>
              Projects with Missing Data
            </h4>
          </Container>
          <Container
            maxWidth='lg'
            component='div'
            style={{ display: 'flex', flexWrap: 'wrap' }}
          >
            {emptyProjects.map((project, key) => (
              <GridItem
                style={{ position: 'relative' }}
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={key}
              >
                <Card
                  style={{ marginBottom: 0, cursor: 'pointer' }}
                  onClick={() =>
                    history.push({
                      pathname: '/admin/project',
                      state: { ...project },
                    })
                  }
                >
                  <CardHeader>
                    <h3 className={classes.cardTitle}>
                      {project.project_name}
                    </h3>
                  </CardHeader>
                  <CardBody>
                    <p className={classes.cardCategory}>Categories:</p>
                    <ul className={classes.cardCategoryList}>
                      {project?.categories.map((cat, key) => (
                        <li
                          className={classes.cardCategory}
                          key={key}
                          style={{ display: 'flex', alignItems: 'center' }}
                        >
                          {cat.status ? (
                            <CheckBoxIcon style={{ marginRight: 10 }} />
                          ) : (
                            <CheckBoxOutlineBlankIcon
                              style={{ marginRight: 10 }}
                            />
                          )}
                          {cat.category_name}
                        </li>
                      ))}
                    </ul>
                  </CardBody>
                </Card>
                {shouldTrain(project) ? (
                  <IconButton
                    aria-label='delete'
                    className={classes.trainBtn}
                    onClick={() => trainProject(project)}
                  >
                    <TrainIcon />
                  </IconButton>
                ) : null}
                {user?.isAdmin ? (
                  <IconButton
                    aria-label='delete'
                    className={classes.dltBtn}
                    onClick={() => deleteProject(project.project_name)}
                  >
                    <DeleteIcon />
                  </IconButton>
                ) : null}
              </GridItem>
            ))}
          </Container>
        </>
      ) : null}
      <Modal
        aria-labelledby='transition-modal-title'
        aria-describedby='transition-modal-description'
        className={classes.modal}
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          {prediction ? (
            <Box boxShadow={3} className={classes.paper}>
              <h2 id='transition-modal-title'>Prediction</h2>
              <p
                id='transition-modal-description'
                style={{
                  fontWeight: 600,
                  textAlign: 'center',
                  fontSize: 20,
                  padding: '20px 0',
                }}
              >
                {prediction}
              </p>
              <Button
                type='button'
                fullWidth
                variant='contained'
                color='primary'
                onClick={() => setPrediction()}
              >
                Predict Again
              </Button>
            </Box>
          ) : (
            <Box boxShadow={3} className={classes.paper}>
              <h2 id='transition-modal-title'>Prediction</h2>
              {/* <p id="transition-modal-description">{JSON.stringify(project)}</p> */}
              <ImageUploader
                withIcon={true}
                buttonText={
                  pictures[0] && pictures[0].name
                    ? pictures[0].name
                    : 'Choose an image'
                }
                onChange={onDrop}
                imgExtension={['.jpg', '.jpeg']}
                maxFileSize={5242880}
              />

              <Button
                type='button'
                fullWidth
                variant='contained'
                color='primary'
                onClick={upload}
                disabled={pictures.length <= 0 || predicting}
              >
                {predicting ? <CircularProgress size={24} /> : 'Predict'}
              </Button>
            </Box>
          )}
        </Fade>
      </Modal>

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
                >
                  {predicting ? <CircularProgress size={24} /> : 'Create'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      </Modal>
    </div>
  )
}
