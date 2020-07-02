require('dotenv').config()
const express = require('express')
const morgan = require('morgan')

console.log(process.env.API_TOKEN)

const app = express()

app.use(morgan('dev'))

const validTypes = [`Bug`, `Dark`, `Dragon`, `Electric`, `Fairy`, `Fighting`, `Fire`, `Flying`, `Ghost`, `Grass`, `Ground`, `Ice`, `Normal`, `Poison`, `Psychic`, `Rock`, `Steel`, `Water`]

// VALIDATION (MIDDLEWARE)
// validate requests before moving on to handle requests (app.get(path, cb))
app.use(function validateBearerToken(req, res, next) {
//   const bearerToken = req.get('Authorization').split(' ')[1]
  const apiToken = process.env.API_TOKEN
  const authToken = req.get('Authorization')

  console.log('validate bearer token middleware')
  
  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status('401').json('Unauthorized request')
  }
  // debugger
  
  // move to the next middleware
  next() 
  // ^^^ callback parameter name ('next') is a convention in Express
})

function handleGetTypes(req, res) {
  res.json(validTypes)
}

app.get('/types', handleGetTypes)

function handleGetPokemon(req, res) {
  res.send('Hello, Pokemon!')
}

app.get('/pokemon', handleGetPokemon)

const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost: ${PORT}...`)
})