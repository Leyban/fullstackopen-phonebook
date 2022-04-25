const morgan = require('morgan');
const express = require('express');
const app = express();

app.use(express.static('build'))
app.use(express.json())
app.use(morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      JSON.stringify(req.body)
    ].join(' ')
  })
  )

const persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
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

const generateID = () => {
    const id = Math.floor(Math.random()*10000);
    return id;
}
const checkUniqueName = (name) => {
    const match = persons.find(person => person.name === name)
    if (match){
        return false;
    }
    return true;
}

app.get('/info', (request, response) => {
    const count = persons.length;
    if (!count) {
        response.write(`Phonebook is empty`)
    } else if (count === 1) {
        response.write(`Phonebook has info for ${count} person`)
    } else {
        response.write(`Phonebook has info for ${count} people`)
    }
    const date = new Date();
    response.write(`\n${date}`);
    response.end()
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.post('/api/persons', (request, response) => {
    const newPerson = request.body;
    const newID = generateID();

    if (!newPerson.name) {
        return response.status(400).json({ 
          error: 'name missing' 
        })
    } else if (!newPerson.number) {
        return response.status(400).json({ 
            error: 'number missing' 
        })
    } else if (!checkUniqueName(newPerson.name)){
        return response.status(400).json({ 
            error: 'name must be unique' 
        })
    }

    newPersonObject = {
        id: newID,
        name: newPerson.name,
        number: newPerson.number
    }

    persons.concat(newPersonObject)
    
    response.status(201).json(newPersonObject)
})


app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(p=> p.id===id);
    if (person){
        return response.json(person)
    } else {
        return response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons.filter(p => p.id!==id)

    response.status(204).end()
})



const PORT = process.env.PORT || 3001;
console.log(`Server running on ${PORT}`)
app.listen(PORT)