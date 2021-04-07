import React from 'react'
import { useState, useEffect } from 'react'
import { useHistory } from 'react-router'
import { makeStyles } from '@material-ui/core/styles'
import { Container, TextField } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import { CircularProgress } from '@material-ui/core'
import { Line } from 'react-chartjs-2'
import { FormHelperText } from '@material-ui/core'
import Select from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'

import { small } from '@material-ui/core'

const TimeSeries = () => {
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
  const [dateColumn, setDateColumn] = useState('')
  const [timeDiff, setTimeDiff] = useState('')
  const [timeVar, setTimeVar] = useState('')
  const [futurePre, setFuturePre] = useState('')

  const [msg, setMsg] = useState({
    content: '',
    type: '',
  })
  const history = useHistory()
  let errorMsg = ''

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
    setPredicting(true)
    e.preventDefault()
    console.log('clicked')
    console.log(
      selectedFile,
      selectedLabelsArray,
      targetSel,
      timeDiff,
      timeVar,
      dateColumn,
      futurePre
    )
    let formData = new FormData()
    formData.append('file', selectedFile[0])
    formData.append(
      'json',
      JSON.stringify({
        drop: selectedLabelsArray,
        target: targetSel.trim(),
        future: parseFloat(futurePre),
        time_diff: parseFloat(timeDiff),
        time_var: timeVar,
        date_col: dateColumn,
      })
    )
    formData.forEach((abc) => console.log(abc))
    await fetch('http://localhost:8000/api/data_TS', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((result) => {
        console.log('agaya response ', result)
        getAlgosreg(result)
        setLoader(false)
      })
      .catch((err) => {
        console.log('error', err)
        setLoader(false)

        setMsg({
          content: err.message,
          type: 'error',
        })
      })
  }
  const getAlgosreg = (response) => {
    let algorithmList = []

    console.log(response)
    setPredicting(false)
    for (let algo in response) {
      algorithmList.push({
        name: algo,
        success: response[algo][0],
        error: response[algo][1],
      })
    }
    console.log('algoList', algorithmList)
    setAlgorithm(algorithmList)
  }
  const predictTime = async () => {
    setPredicting(true)
    console.log('prediction start')
    let model = algoSelected
    if (!model) {
      setMsg({
        content: 'Please select a model first',
        type: 'error',
      })
    }
    let data = JSON.stringify({
      model,
    })
    console.log('data ', data, typeof data)
    await fetch('http://localhost:8000/api/TS_prediction', {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: data,
    })
      .then((response) => response.json())
      .then((result) => {
        setPredicting(false)
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
  const chart = {
    labels: result.DateTime,
    datasets: [
      {
        label: 'Predictions',
        fill: false,
        lineTension: 0.5,
        backgroundColor: 'rgba(75,192,192,1)',
        borderColor: 'rgba(0,0,0,1)',
        borderWidth: 2,
        data: result.Predictions,
      },
    ],
  }

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
                <h3>Drop Label</h3>
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
                <h3>Target Selection</h3>
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
              <section>
                <h3>Time Format and Date Column</h3>
                <Grid container>
                  <Grid item xs={5}>
                    <FormControl>
                      <TextField
                        type='text'
                        variant='outlined'
                        placeholder='Date time Column'
                        helperText='Column Name is case sensitive'
                        onChange={(e) => setDateColumn(e.target.value)}
                      ></TextField>
                    </FormControl>
                  </Grid>
                  <FormControl>
                    <InputLabel id='demo-simple-select-label'>
                      Date Format
                    </InputLabel>
                    <select labelId='demo-simple-select-label'>
                      <option disabled selected>
                        Date Format
                      </option>
                      <option>yyyy/MM/dd HH:mm:ss</option>
                      <option>yyyy/MM/dd</option>
                    </select>
                  </FormControl>
                </Grid>
              </section>
              <section>
                <h3>Time Interval</h3>
                <small>
                  This is the frequency at which entries are registered into
                  your data file.
                </small>
                <Grid container>
                  <Grid item xs={4}>
                    <form>
                      <TextField
                        type='text'
                        variant='outlined'
                        placeholder='Number'
                        onChange={(e) => setTimeDiff(e.target.value)}
                      ></TextField>
                    </form>
                  </Grid>

                  <select
                    className='form-control'
                    id='unit'
                    onChange={(e) => setTimeVar(e.target.value)}
                  >
                    <option disabled selected>
                      Unit
                    </option>
                    <option>Seconds</option>
                    <option>Minutes</option>
                    <option>Hours</option>
                    <option>Days</option>
                    <option>Months</option>
                    <option>Years</option>
                  </select>
                </Grid>
              </section>
              <section>
                <h3>Forecasting Period</h3>
                <Grid container>
                  <Grid item xs={3}>
                    <FormControl>
                      <TextField
                        type='number'
                        variant='outlined'
                        placeholder='Number'
                        onChange={(e) => setFuturePre(e.target.value)}
                      />
                    </FormControl>
                  </Grid>
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
                  disabled={predicting}
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
                  onClick={predictTime}
                  className='formButton'
                >
                  {predicting ? <CircularProgress size={24} /> : 'Predict'}
                </Button>
              </div>
            </section>
          ) : null}
          {!!result ? (
            <div>
              <Line
                data={chart}
                options={{
                  title: {
                    display: true,
                    text: 'Average Sales',
                    fontSize: 20,
                  },
                  legend: {
                    display: true,
                    position: 'right',
                  },
                }}
              />
            </div>
          ) : null}
        </Card>
      </Container>
    </div>
  )
}

export default TimeSeries
