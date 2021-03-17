import React, { useState } from 'react'
import Avatar from '@material-ui/core/Avatar'
import Button from '@material-ui/core/Button'
import CssBaseline from '@material-ui/core/CssBaseline'
import TextField from '@material-ui/core/TextField'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Link from '@material-ui/core/Link'
import Paper from '@material-ui/core/Paper'
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import { CircularProgress, Snackbar } from '@material-ui/core'
import MuiAlert from '@material-ui/lab/Alert'
import { useHistory } from 'react-router-dom'
import AuthImg from './../../assets/img/auth.jpg'

function Copyright() {
  return (
    <Typography variant='body2' color='textSecondary' align='center'>
      {'Copyright © '}
      <Link color='inherit' href='https://material-ui.com/'>
        Category Prediction
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  )
}

function Alert(props) {
  return <MuiAlert elevation={6} variant='filled' {...props} />
}

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
  },
  image: {
    backgroundImage: `url(${AuthImg})`,
    backgroundRepeat: 'no-repeat',
    backgroundColor:
      theme.palette.type === 'light'
        ? theme.palette.grey[50]
        : theme.palette.grey[900],
    backgroundSize: 'cover',
    backgroundPosition: 'right',
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}))

export default function SignUp() {
  const classes = useStyles()
  const history = useHistory()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({
    content: '',
    type: '',
  })

  const onChange = (e) => {
    const { name, value } = e.target
    if (name === 'name') {
      setName(value)
    } else if (name === 'email') {
      setEmail(value)
    } else if (name === 'password') {
      setPassword(value)
    }
  }

  const onSubmit = () => {
    setLoading(true)
    fetch('http://localhost:5000/api/sign_up', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullname: name,
        user_email: email,
        password: password,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        setLoading(false)
        if (res.status == 200) {
          localStorage.setItem('user', JSON.stringify(res))
          setMsg({
            content: res.message,
            type: 'success',
          })
          history.push('/admin')
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

  const ValidateEmail = (email) => {
    if (
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
        email
      )
    ) {
      return true
    }
    return false
  }

  return (
    <Grid container component='main' className={classes.root}>
      <Snackbar
        open={msg.content.length > 0}
        onClose={() =>
          setMsg({
            content: '',
            type: '',
          })
        }
        autoHideDuration={6000}
      >
        <Alert
          onClose={() =>
            setMsg({
              content: '',
              type: '',
            })
          }
          severity={msg.type}
        >
          {msg.content}
        </Alert>
      </Snackbar>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} className={classes.image} />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component='h1' variant='h5'>
            Sign Up
          </Typography>
          <TextField
            variant='outlined'
            margin='normal'
            required
            fullWidth
            id='name'
            label='Full Name'
            name='name'
            autoComplete='name'
            autoFocus
            onChange={onChange}
          />
          <TextField
            variant='outlined'
            margin='normal'
            required
            fullWidth
            id='email'
            label='Email Address'
            name='email'
            autoComplete='email'
            onChange={onChange}
          />
          <TextField
            variant='outlined'
            margin='normal'
            required
            fullWidth
            name='password'
            label='Password'
            type='password'
            id='password'
            autoComplete='current-password'
            onChange={onChange}
          />

          <Button
            type='button'
            fullWidth
            variant='contained'
            color='primary'
            className={classes.submit}
            disabled={
              name.length < 3 ||
              !ValidateEmail(email) ||
              password.length < 4 ||
              loading
            }
            onClick={onSubmit}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>
          <Grid container>
            <Grid item xs></Grid>
            <Grid item>
              <Link href='auth/signin' variant='body2'>
                {'Already registered? Sign In'}
              </Link>
            </Grid>
          </Grid>
          <Box mt={5}>
            <Copyright />
          </Box>
        </div>
      </Grid>
    </Grid>
  )
}
