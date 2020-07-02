require('dotenv').config()
console.log(process.env.API_TOKEN)
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const POKEDEX = require('./pokedex.json')


const app = express()

app.use(morgan('dev'))
app.use(cors())


// VALIDATION MIDDLEWARE /////////////////////////////////
// validate requests before moving on to handle requests >> app.get(path, cb)
app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN
  const authToken = req.get('Authorization')

  console.log('validate bearer token middleware')
  
  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status('401').json('Unauthorized request')
  }
  // debugger
  
  // move to the next middleware
  next() 
  // ^^^ fyi: 'next' callback parameter name is a convention in Express
})

const validTypes = [`Bug`, `Dark`, `Dragon`, `Electric`, `Fairy`, `Fighting`, `Fire`, `Flying`, `Ghost`, `Grass`, `Ground`, `Ice`, `Normal`, `Poison`, `Psychic`, `Rock`, `Steel`, `Water`]

// GET /types //////////////////////////////////////
app.get('/types', 
  function handleGetTypes(req, res) {
    res.json(validTypes)
})


// GET /pokemon ////////////////////////////////////
app.get('/pokemon', function handleGetPokemon(req, res) {
  let response = POKEDEX.pokemon 
  const { name = '', type } = req.query

  // VALIDATION
  if(name) {
    if(name.length === 0) {
      res.status(400).send("Name required")
    }
  } 

  if(type) {
    if(type.length === 0) {
      res.status(400).send("Type required")
    }
    if(!validTypes.map(t => t.toLowerCase()).includes(type.toLowerCase())) { 
      res.status(400).send(`Only these pokemon types are valid: ${validTypes.join(', ')}`)
    }
  } 
  
  // queries valid, so...

  if(name) {
    response = response.filter(pokemon => 
      pokemon
        .name
        .toLowerCase()
        .includes(name.toLowerCase())
    )
  }

  if (type) {
    response = response.filter(pokemon => {
      return pokemon.type
          .map(t => t.toLowerCase())
          .includes(type.toLowerCase())
    })
  }

  if (response.length === 0) {
    response = "No results found."
  }

  res.json(response)
})


// SERVER
const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost: ${PORT}...`)
})
