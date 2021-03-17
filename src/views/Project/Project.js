import React, { useEffect, useState } from 'react'
// @material-ui/core
import { makeStyles } from '@material-ui/core/styles'
// core components
import GridItem from 'components/Grid/GridItem.js'
import Card from 'components/Card/Card.js'
import CardHeader from 'components/Card/CardHeader.js'
import ImageUploader from 'react-images-upload'
import Dropzone, { useDropzone } from 'react-dropzone'
import AddIcon from '@material-ui/icons/Add'
import DeleteIcon from '@material-ui/icons/Delete'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import styles from 'assets/jss/material-dashboard-react/views/dashboardStyle.js'
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Container,
  Fade,
  Grid,
  IconButton,
  Modal,
} from '@material-ui/core'
import CardBody from 'components/Card/CardBody'
import { useHistory } from 'react-router-dom'
import { useCallback } from 'react'

const useStyles = makeStyles(styles)

export default function Project(props) {
  const history = useHistory()

  const [pictures, setPictures] = useState(
    Array(props.location.state.categories.length).fill([])
  )

  const [uploading, setUploading] = useState(
    Array(props.location.state.categories.length).fill(false)
  )
  // const [urls, setUrls] = useState([]);
  let urls = []
  const [msg, setMsg] = useState({
    content: '',
    type: '',
  })
  const deleteProject = () => {
    fetch('http://localhost:5000/api/delete_project', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_name: props.location.state.project_name,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.status == 200) {
          history.push('/admin')
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
  useEffect(() => {
    console.log('pictures array', pictures)
  }, [pictures])

  const onDrop = (picture, index) => {
    console.log(picture, index)
    let newArr = [...pictures]
    newArr[index] = picture
    console.log('new aerray', newArr)
    setPictures(newArr)
  }
  // const onDrop = useCallback((acceptedFiles) => {
  //   console.log('accepted files', acceptedFiles)
  // }, [])
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({ onDrop })

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
        setUploading(Array(props.location.state.categories.length).fill(false))
        console.log(err)
      })
  }

  const uploadPictures = (index) => {
    setUploading(Array(props.location.state.categories.length).fill(true))
    const PRESET = 'c5lwhjac'

    Promise.all(
      pictures[index].map(async (pic) => {
        const data = new FormData()
        data.append('file', pic)
        data.append('upload_preset', PRESET)

        await handleUpload(data)
      })
    ).then(() => {
      upload(index)
    })
  }

  const upload = (index) => {
    fetch('http://localhost:5000/api/upload_data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_name: props.location.state.project_name,
        category: props.location.state.categories[index].category_name,
        urls,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log('response', res)
        if (res.status == 200) {
          setUploading(
            Array(props.location.state.categories.length).fill(false)
          )
          urls = []
          let arr = pictures
          arr[index] = []
          setPictures(arr)
          setMsg({
            content: res.message,
            type: 'success',
          })
        } else {
          throw new Error(res.message)
        }
      })
      .catch((err) => {
        setUploading(Array(props.location.state.categories.length).fill(false))
        urls = []

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
      <p className={classes.pageName}>{props.location.state.project_name}</p>
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

      {/* <GridContainer> */}
      <Container
        maxWidth='lg'
        component='div'
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <div style={{ paddingLeft: 15, paddingRight: 15 }}>
          <Button
            type='button'
            variant='contained'
            color='secondary'
            onClick={deleteProject}
          >
            Delete
          </Button>
        </div>
      </Container>
      <Container
        maxWidth='lg'
        component='div'
        style={{ display: 'flex', flexWrap: 'wrap' }}
      >
        {/* <GridItem xs={12} sm={6}>
          <Card style={{ marginBottom: 0, cursor: 'pointer' }}>
            <CardHeader>
              <h3 className={classes.cardTitle}>
                {props.location.state.categories[0].category_name}
              </h3>
            </CardHeader>
            <CardBody>
              <ImageUploader
                withIcon={false}
                buttonText='Select Images'
                onChange={onDropOne}
                imgExtension={['.jpg', '.jpeg']}
                maxFileSize={5242880}
              />
              <ul>
                {picturesOne.map((pic, key) => {
                  return <li key={key}>{pic.name}</li>
                })}
              </ul>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  type='button'
                  variant='contained'
                  color='primary'
                  onClick={uploadOne}
                  disabled={picturesOne.length <= 0 || uploadingOne}
                >
                  {uploadingOne ? <CircularProgress size={24} /> : 'Upload'}
                </Button>
              </div>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem xs={12} sm={6}>
          <Card style={{ marginBottom: 0, cursor: 'pointer' }}>
            <CardHeader>
              <h3 className={classes.cardTitle}>
                {props.location.state.categories[1].category_name}
              </h3>
            </CardHeader>
            <CardBody>
              <ImageUploader
                withIcon={false}
                buttonText='Select Images'
                onChange={onDropTwo}
                imgExtension={['.jpg', '.jpeg']}
                maxFileSize={5242880}
              />
              <ul>
                {picturesTwo.map((pic, key) => {
                  return <li key={key}>{pic.name}</li>
                })}
              </ul>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  type='button'
                  variant='contained'
                  color='primary'
                  onClick={uploadTwo}
                  disabled={picturesTwo.length <= 0 || uploadingTwo}
                >
                  {uploadingTwo ? <CircularProgress size={24} /> : 'Upload'}
                </Button>
              </div>
            </CardBody>
          </Card>
        </GridItem> */}

        {props.location.state.categories.map((xd, index) => (
          <GridItem xs={12} sm={6}>
            <Card style={{ marginBottom: 0, cursor: 'pointer' }}>
              <CardHeader>
                <h3 className={classes.cardTitle}>{xd.category_name}</h3>
              </CardHeader>
              <CardBody>
                {/* <ImageUploader
                  withIcon={false}
                  buttonText='Select Images'
                  onChange={onDrop}
                  imgExtension={['.jpg', '.jpeg']}
                  maxFileSize={5242880}
                /> */}
                <section className='container'>
                  {/* <div {...getRootProps({ className: 'dropzone' })}>
                    <input {...getInputProps()} onDrop={onDrop} />
                   
                    <p>
                      Drag 'n' drop pictures here, or click to select pictures
                    </p>
                  </div> */}
                  {/* <Dropzone
                    onDrop={(file, index) => onDrop(file, index)}
                    name='content1'
                    className='dropzones'
                    multiple={true}
                  ></Dropzone> */}
                  <Dropzone onDrop={(file) => onDrop(file, index)}>
                    {({ getRootProps, getInputProps }) => (
                      <section>
                        <div {...getRootProps()}>
                          <input {...getInputProps()} />
                          <p>
                            Drag 'n' drop some pictures here, or click to select
                            pictures
                          </p>
                        </div>
                      </section>
                    )}
                  </Dropzone>
                  <aside>
                    <h4>Files</h4>
                    <ul>
                      {pictures[index].map((file) => (
                        <li key={file.path}>
                          {file.path} - {file.size} bytes
                        </li>
                      ))}
                    </ul>
                  </aside>
                </section>
                <ul>
                  {/* {pictures[index].map((pic, key) => {
                    return <li key={key}>{pic.name}</li>
                  })} */}
                </ul>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    type='button'
                    variant='contained'
                    color='primary'
                    onClick={() => uploadPictures(index)}
                    disabled={pictures[index].length <= 0 || uploading[index]}
                  >
                    {uploading[index] ? (
                      <CircularProgress size={24} />
                    ) : (
                      'Upload'
                    )}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </GridItem>
        ))}
      </Container>
    </div>
  )
}
