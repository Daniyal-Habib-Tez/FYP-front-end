import React from 'react'
import { Container, TextField } from '@material-ui/core'
import { useHistory } from 'react-router'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardBody from 'components/Card/CardBody'
import { makeStyles } from '@material-ui/core/styles'
import styles from 'assets/jss/material-dashboard-react/views/dashboardStyle.js'
import { CircularProgress } from '@material-ui/core'
import { useState, useEffect } from 'react'
import Dropzone, { useDropzone } from 'react-dropzone'
import { ToastContainer, toast } from 'react-toastify'

import 'react-toastify/dist/ReactToastify.css'

const Clustering = () => {
  const history = useHistory()
  const useStyles = makeStyles(styles)
  const [pictures, setPictures] = useState([])
  const [predicting, setPredicting] = useState(false)
  const [uploading, setUpLoading] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectCreated, setprojectCreated] = useState(true)
  const [successUrl, setsuccessUrl] = useState(true)
  const [picUploaded, setpicUploaded] = useState('')
  const [givenUrl, setgivenUrl] = useState([])
  const [created, setCreated] = useState('')
  const [alreadyCreated, setalreadyCreated] = useState('')
  const [msg, setMsg] = useState({
    content: '',
    type: '',
  })

  let urls = []
  toast.configure()

  const onDrop = (picture) => {
    setPictures(picture)
    console.log('pictures')
  }

  useEffect(() => {
    console.log('pictures array', pictures)
  }, [pictures])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  function refreshPage() {
    window.location.reload(false)
  }

  const onChange = (e) => {
    if (e.target.name === 'projectName') {
      setProjectName(e.target.value)
    }
  }
  const createProject = () => {
    console.log('Project Name', projectName)
    setPredicting(true)
    fetch('http://localhost:8008/api/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_name: projectName,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log('response', res)
        if (res.status == 200) {
          setCreated(res)
          setprojectCreated(false)
          toast.success('Created Succesfully', {
            position: 'bottom-right',
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          })
          setPredicting(false)
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
        toast.error('Project with this name already existed', {
          position: 'bottom-right',
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        })
        console.log('error', err)

        setMsg({
          content: err.message,
          type: 'error',
        })
      })
  }

  const handleUpload = async (data) => {
    const URL = 'https://api.cloudinary.com/v1_1/n4beel/image/upload'

    await fetch(URL, {
      method: 'POST',
      body: data,
    })
      .then((response) => response.json())
      .then((result) => {
        console.log('Success:', result.url)
        console.log('newUrls', urls)
        urls = [...urls, result.url]
        return
      })
      .catch((err) => {
        setPredicting(false)
        console.log(err)
      })
  }
  const uploadPictures = () => {
    setPredicting(true)
    const PRESET = 'c5lwhjac'

    Promise.all(
      pictures.map(async (pic) => {
        const data = new FormData()
        data.append('file', pic)
        data.append('upload_preset', PRESET)
        console.log('upload pictures', pictures)

        await handleUpload(data)
      })
    ).then(() => {
      upload()
      console.log('updated')
    })
  }
  const upload = () => {
    setPredicting(true)
    fetch('http://localhost:8008/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_name: projectName,
        urls,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log('response', res)
        if (res.status == 200) {
          toast.success('Uploaded Succesfully', {
            position: 'bottom-right',
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          })
          setPredicting(false)
          setsuccessUrl(false)
          setpicUploaded(res)
          urls = []
          let arr = pictures
          setPictures(arr)
          console.log('success')
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
        urls = []

        console.log('error', err)

        setMsg({
          content: err.message,
          type: 'error',
        })
      })
  }
  const makeCluster = () => {
    setUpLoading(true)
    fetch('http://localhost:8008/api/cluster', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_name: projectName,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log('response', res)
        if (res.status == 200) {
          const result = Object.values(res)
          result.pop()
          setgivenUrl(result)
          console.log('cluster ban gaye', result, givenUrl)
          setUpLoading(false)
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
        setalreadyCreated(err.message)

        setMsg({
          content: err.message,
          type: 'error',
        })
      })
  }

  const classes = useStyles()

  return (
    <div>
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
        <p
          style={{
            position: 'absolute',
            top: 6,
            right: 174,
            cursor: 'pointer',
            zIndex: 100000000,
          }}
          onClick={refreshPage}
        >
          Create Project Again
        </p>
      </Container>
      <Container>
        <h2 id='transition-modal-title' style={{ textAlign: 'center' }}>
          Clustering
        </h2>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Card
              style={{
                marginBottom: 0,
                cursor: 'pointer',
              }}
            >
              <CardBody>
                {projectCreated ? (
                  <section className='container'>
                    <h3 className={classes.cardTitle}>Create Project</h3>{' '}
                    <TextField
                      label='Project Name'
                      variant='outlined'
                      style={{ width: '100%', marginBottom: '9px' }}
                      name='projectName'
                      onChange={onChange}
                    />
                    <div
                      style={{
                        width: 200,
                        margin: '10px auto 0',
                      }}
                    >
                      <Button
                        type='button'
                        fullWidth
                        variant='contained'
                        color='primary'
                        onClick={createProject}
                      >
                        {predicting ? <CircularProgress size={24} /> : 'Create'}
                      </Button>
                    </div>
                  </section>
                ) : null}
                {!!created ? (
                  <section>
                    <h3 className={classes.cardTitle}>{projectName}</h3>
                    <small>{created.message}</small>

                    <Dropzone onDrop={(acceptedFiles) => onDrop(acceptedFiles)}>
                      {({ getRootProps, getInputProps }) => (
                        <section
                          style={{ borderStyle: 'groove', marginBottom: '5px' }}
                        >
                          <div {...getRootProps()}>
                            <input {...getInputProps()} />
                            <p>
                              Drag 'n' drop atleast 10 jpg images here, or click
                              to select images
                            </p>
                          </div>
                        </section>
                      )}
                    </Dropzone>
                    {pictures.length > 0 ? (
                      <aside>
                        <h4>Files</h4>
                        <ul>
                          {pictures.map((file) => (
                            <li key={file.path}>
                              {file.path} - {file.size} bytes
                            </li>
                          ))}
                        </ul>
                      </aside>
                    ) : null}
                    <div
                      style={{
                        width: 200,
                        margin: '10px auto 0',
                      }}
                    >
                      <Button
                        type='button'
                        onClick={() => uploadPictures()}
                        fullWidth
                        variant='contained'
                        color='primary'
                        style={{
                          marginTop: '9px',
                        }}
                        disabled={pictures.length <= 10}
                      >
                        {predicting ? <CircularProgress size={24} /> : 'Upload'}
                      </Button>
                    </div>
                    <p> {picUploaded.message}</p>
                  </section>
                ) : null}
              </CardBody>
            </Card>
          </Grid>
          <Grid item xs={6}>
            {picUploaded ? (
              <Card>
                <CardBody>
                  <section>
                    <h3 className={classes.cardTitle}>Clusters</h3>
                    <div
                      style={{
                        width: 200,
                        margin: '10px auto 0',
                      }}
                    >
                      <Button
                        type='button'
                        fullWidth
                        variant='contained'
                        color='primary'
                        onClick={makeCluster}
                      >
                        {uploading ? (
                          <CircularProgress size={24} />
                        ) : (
                          'Make Clusters'
                        )}
                      </Button>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                      {givenUrl.map((xd) => (
                        <div>
                          <img
                            src={xd}
                            style={{
                              maxHeight: '150px',
                              padding: '9px',
                            }}
                          ></img>
                        </div>
                      ))}
                    </div>
                  </section>
                </CardBody>
              </Card>
            ) : null}
          </Grid>
        </Grid>
      </Container>
    </div>
  )
}

export default Clustering
