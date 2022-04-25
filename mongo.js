const mongoose = require('mongoose');

if (process.argv.length < 3) {
    console.log('Please provide the password as an argument: node mongo.js <password>')
    process.exit(1)
} else if (process.argv.length === 4) {
    console.log('Please provide the password, name, and number as an argument: node mongo.js <password> <name> <number>')
    process.exit(1)
} else if (process.argv.length > 5) {
    console.log('Please provide the password, name, and number as an argument: node mongo.js <password> <name> <number>')
    process.exit(1)
}

const password = process.argv[2]

const url =
    `mongodb+srv://leyban:${password}@leybancluster.af0js.mongodb.net/phonebookDB?retryWrites=true&w=majority`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
        name: String,
        number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 5) {
    const personName = process.argv[3]
    const personNumber = process.argv[4]

    const person = new Person({
        name: personName,
        number: personNumber,
    })
    
    person.save().then(result => {
        console.log(`added ${personName} number ${personNumber} to phonebook`)
        mongoose.connection.close()
    })
} else {
    Person.find({}).then(result => {
        console.log('phonebook')
        result.forEach(entry => {
            console.log(entry.name, entry.number)
        })
        mongoose.connection.close()
    })
}

