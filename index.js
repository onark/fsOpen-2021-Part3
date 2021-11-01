const express = require('express')
const morgan = require('morgan')

const app = express()

app.use(express.json())

const originalSend = app.response.send
app.response.send = function sendOverWrite(body) {
  originalSend.call(this, body)
  this.__custombody__ = body
}
morgan.token('body', (_req, res) =>
  JSON.stringify(res.__custombody__),
)
app.use(morgan(':method :url :status :res[content-length] :body - :response-time ms'))

let persons = [
    { 
      "id": 1,
      "name": "XArto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/', (request, response) => {
  response.send('<h1>Hello persons!</h1>')
})

app.get('/info', (request, response) => {
  const today = new Date()
  const count = persons.length
  const respString = `Phonebook has info for ${count} people <br />
    ${today}`
    response.send(respString)
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  response.json(person)
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ 
      error: 'name or number missing' 
    })
  }

  if (persons.some(p => p.name === body.name)) {
    return response.status(400).json({ 
      error: 'name must be unique' 
    })
  }

  const personName = body.name
  const personNumber = body.number

  const person = {
    name: personName,
    number: personNumber,
    id: Math.floor(Math.random() * 100)
  }

  persons = persons.concat(person)

  response.json(person)
})


app.delete('/api/persons/:id', (request, response, next) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})