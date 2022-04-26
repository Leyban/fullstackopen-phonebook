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


app.get('/info', (request, response, next) => {
    Person.find({})
        .then(persons => {
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
        .catch(error => next(error))
})

app.get('/api/persons', (request, response, next) => {
    Person.find({})
        .then(persons => {
            response.json(persons)
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
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

    newPersonObject.save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
        .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
    const id = request.params.id;
    Person.findById(id)
        .then(returnedPerson => {
            response.json(returnedPerson)
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const updatedPerson = request.body;
    const id = request.params.id;

    Person.findByIdAndUpdate(id, updatedPerson, { new: true })
        .then(returnedPerson => response.json(returnedPerson))
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id;
    Person.findByIdAndRemove(id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: "unknown endpoint" })
}

// catch unknown endpoints
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}

// handle error cases
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
console.log(`Server running on ${PORT}`)
app.listen(PORT)