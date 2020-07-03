require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')
const POKEDEX = require('./pokedex.json')


const app = express()

// INSTALL MIDDLEWARE
const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'dev' // for production (heroku)
app.use(morgan(morganSetting))
app.use(helmet()) // see: https://github.com/helmetjs/helmet#how-it-works
app.use(cors())


// VALIDATION MIDDLEWARE /////////////////////////////////
// validate requests before moving on to handle requests >> app.get(path, cb)
app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN
  const authToken = req.get('Authorization')
  
  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status('401').json('Unauthorized request')
  }

  next() 
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
  
  // queries valid, so proceed...

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

// Last middleware in pipeline.
// Hide sensitive server error messages for deploying to production.
// 4 parameters in middleware. Express knows to treat this as error handler.
app.use((error, req, res, next) => {
  let response
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' }}
  } else {
    response = { error }
  }
  res.status(500).json(response)
})

const PORT = process.env.PORT || 8000; // for production (heroku)

app.listen(PORT, () => {
  // console.log(`Server listening at http://localhost:${PORT}...`)
})
