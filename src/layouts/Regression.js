import React from 'react'
import { Container, TextField } from '@material-ui/core'
import { useHistory } from 'react-router'
import { useState, useEffect } from 'react'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CircularProgress from '@material-ui/core/Card'
import readXlsxFile from 'read-excel-file'
import GridItem from 'components/Grid/GridItem.js'

import { makeStyles } from '@material-ui/core/styles'

import styles from 'assets/jss/material-dashboard-react/views/dashboardStyle.js'
import { container } from 'assets/jss/material-dashboard-react'

const useStyles = makeStyles({
  ...styles,
  ...{
    formButtonCont: {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
    },
    formButton: {
      minWidth: 200,
    },
  },
})

const Regression = () => {
  const [predicting, setPredicting] = useState(false)
  const [loader, setLoader] = useState(true)
  const [columnList, setColumnList] = useState([])
  const [algorithms, setAlgorithm] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [labelsArray, setLabelsArray] = useState([])
  const [targetsArray, setTargetsArray] = useState([])
  const [targetSel, setTargetSel] = useState('')
  const [selectedLabelsArray, setSelectedLabelsArray] = useState([])
  const [result, setResult] = useState('')
  const [algoSelected, setAlgoSel] = useState([])
  const [colValue, setColValue] = useState([])
  const [uploadForm, setUploadForm] = useState(true)

  const [msg, setMsg] = useState({
    content: '',
    type: '',
  })

  const history = useHistory()
  const classes = useStyles()
  let errorMsg = ''
  const fileUploader = (e) => {
    console.log(
      'file uploader input',
      e.target.files[0],
      typeof e.target.files[0]
    )
    setSelectedFile(e.target.files)
  }
  useEffect(() => {
    console.log('file upload', selectedFile)
  }, [selectedFile])

  const targetS = (e) => {
    console.log('target selected item', e.target.value, typeof e.target.value)
    setTargetSel(e.target.value)
  }
  const algoSel = (e) => {
    console.log('algo selected ', e.target.value, typeof e.target.value)
    setAlgoSel(e.target.value)
  }
  const colVal = (e, index) => {
    let arr = colValue
    arr[index] = e.target.value
    setColValue(arr)
  }

  useEffect(() => {
    console.log('hello', targetSel)
  }, [targetSel])

  const readFile = (e) => {
    e.preventDefault()
    setUploadForm(false)
    if (!selectedFile[0]) {
      errorMsg = 'Please select a file first'
    } else {
      errorMsg = ''
      var reader = new FileReader()
      reader.readAsText(selectedFile[0])
      console.log('reader', reader)
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
    setPredicting(true)
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
        setPredicting(false)
        getAlgosreg(result)
      })
      .catch((err) => {
        console.log('error', err)
        setPredicting(false)

        setMsg({
          content: err.message,
          type: 'error',
        })
      })
  }
  const getAlgosreg = (response) => {
    let columnnList = []
    let algorithmList = []

    console.log(response)
    setLoader(false)
    columnnList = response['column_name']
    delete response['column_name']
    for (let algo in response) {
      algorithmList.push({
        name: algo,
        success: response[algo][0],
        error: response[algo][1],
      })
    }
    console.log('columnList', columnnList)
    console.log('algoList', algorithmList)
    setColumnList(columnnList)
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

      let data = JSON.stringify({
        columns: columns,
        model: model,
      })
      console.log('data ', data, typeof data)

      fetch('http://localhost:8000/api/prediction', {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: data,
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

  return (
    <div className='regression'>
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
      <Container style={{}}>
        <h2 id='transition-modal-title' style={{ textAlign: 'center' }}>
          Enter a CSV
        </h2>
        <Card
          style={{
            marginBottom: 0,
            padding: 20,
          }}
        >
          {uploadForm ? (
            <section className='container'>
              <form
                onSubmit={readFile}
                className='file-upload'
                style={{
                  textAlign: 'center',
                }}
              >
                <input
                  type='file'
                  label='Select a CSV file'
                  onChange={(e) => fileUploader(e)}
                ></input>
                <div
                  style={{
                    width: 200,
                    margin: '20px auto 0',
                  }}
                >
                  <Button
                    type='submit'
                    fullWidth
                    variant='contained'
                    color='primary'
                    style={{
                      marginTop: '9px',
                    }}
                    className='formButton'
                    disabled={selectedFile <= 0}
                  >
                    {predicting ? <CircularProgress size={24} /> : 'Upload'}
                  </Button>
                </div>
              </form>
            </section>
          ) : null}
          {labelsArray.length > 0 ? (
            <>
              <section>
                <h2>Drop Label</h2>
                <Grid container>
                  {labelsArray.map((plan) => (
                    <Grid item xs={3}>
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
                    </Grid>
                  ))}
                </Grid>
              </section>
              <section>
                <h2>Target Selection</h2>
                <Grid container>
                  {targetsArray.map((tx) => (
                    <Grid item xs={3}>
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
                    </Grid>
                  ))}
                </Grid>
              </section>

              <div
                style={{
                  width: 200,
                  margin: '20px auto 0',
                }}
              >
                <Button
                  type='submit'
                  fullWidth
                  variant='contained'
                  color='primary'
                  style={{
                    marginTop: '9px',
                  }}
                  disabled={targetSel <= 0}
                  className='formButton'
                  onClick={submitForm}
                >
                  {predicting ? <CircularProgress size={24} /> : 'Next'}
                </Button>
              </div>
            </>
          ) : null}
          {algorithms.length > 0 ? (
            <section>
              <h2>Select Algorithm :</h2>
              <Grid container>
                {algorithms.map((alg) => (
                  <Grid item xs={3}>
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
                  </Grid>
                ))}
              </Grid>
              <section>
                <h2>Input Parameters : </h2>
                <p>When entering a number please insert (0-9) numbers only :</p>
                <Grid container spacing={2}>
                  {columnList.map((col, index) => (
                    <Grid item xs={3}>
                      <TextField
                        label={col}
                        variant='outlined'
                        placeholder={col}
                        onChange={(value) => colVal(value, index)}
                        style={{ width: '100%' }}
                      />

                      {/* <input
                        placeholder={col}
                        onChange={(value) => colVal(value, index)}
                      ></input> */}
                    </Grid>
                  ))}
                </Grid>
              </section>
              <div
                style={{
                  width: 200,
                  margin: '20px auto 0',
                }}
              >
                <Button
                  type='submit'
                  fullWidth
                  variant='contained'
                  color='primary'
                  style={{
                    marginTop: '9px',
                  }}
                  // disabled={colValue.length <= 0}
                  onClick={predictReg}
                  className='formButton'
                >
                  {predicting ? <CircularProgress size={24} /> : 'Predict'}
                </Button>
              </div>
            </section>
          ) : null}
          {!!result ? (
            <section>
              <p>Your predicted value is {result}</p>
            </section>
          ) : null}
        </Card>
      </Container>
    </div>
  )
}

export default Regression
