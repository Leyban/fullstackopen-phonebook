require('dotenv').config()
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

const Person = require('./models/person')

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
    const id = Math.floor(Math.random() * 10000);
    return id;
}
const checkUniqueName = (name) => {
    const match = persons.find(person => person.name === name)
    if (match) {
        return false;
    }
    return true;
}

app.get('/info', (request, response) => {
    Person.find({}).then(persons => {
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
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.post('/api/persons', (request, response) => {
    const newPerson = request.body;

    if (!newPerson.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    } else if (!newPerson.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    }

    newPersonObject = new Person({
        name: newPerson.name,
        number: newPerson.number,
    })

    newPersonObject.save().then(savedPerson => {
        response.json(savedPerson)
    })
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id;
    Person.findById(id)
        .then(returnedPerson => {
            response.json(returnedPerson)
        })
        .catch(error => {
            response.status(404).send(error).end()
        })

})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id;
    Person.findByIdAndDelete(id)
        .then(response => {
            response.json(response)
        })
        .catch(error => {
            response.status(404).send(error).end()
        })
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: "unknown endpoint" })
}

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
console.log(`Server running on ${PORT}`)
app.listen(PORT)