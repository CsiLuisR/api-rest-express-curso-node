const express = require('express')
const config = require('config')
const logger = require('./logger')
const Joi = require('@hapi/joi')
const morgan = require('morgan')

const app = express()

app.use(express.json()) //middleware de archivos JSON
app.use(express.urlencoded({extended:true})) //middleware de conexion por url
app.use(express.static('public')) //middleware de archivos staticos

//configuracion de entornos
console.log('Aplicacion: ' + config.get('nombre'))
console.log('BD server: ' + config.get('configDB.host'))


//uso de middleware de tercero morgan
app.use(morgan('tiny'))
console.log('morgan habilitado');


app.use(logger.log)
app.use(logger.auth)



const usuarios = [
    {id:1, nombre:'luis'},
    {id:2, nombre:'oscar'},
    {id:3, nombre:'hugo'}
]

app.get('/', (req, res) => {
    res.send('hola mundo desde express');
}) //peticion

app.get('/api/usuarios', (req, res) => {
    res.send(usuarios)
})

app.get('/api/usuarios/:id', (req, res) => {
    let usuario = existeUsuario(req.params.id)
    if(!usuario){
        res.status(404).send('El usuario no fue encontrado')
        return
    } 
})

app.post('/api/usuarios', (req, res) =>{
    
    const schema = Joi.object({
        nombre: Joi.string() 
            .min(3)
            .max(30)
            .required()
    })
    const {error, value} = validarUsuario(req.body.nombre)
    if(!error){
        const usuario = {
            id: usuarios.length + 1,
            nombre: value.nombre
        }
        usuarios.push(usuario)
        res.send(usuario)
    }else{
        res.status(400).send(error.message)
    }
}) 

app.put('/api/usuarios/:id', (req, res) => {
    //encontrar si existe el objeto usuario
    // let usuario = usuarios.find(u => u.id === parseInt(req.params.id))
    let usuario = existeUsuario(req.params.id)
    if(!usuario){
        res.status(404).send('El usuario no fue encontrado')
        return
    } 

    
    const {error, value} = validarUsuario(req.body.nombre)
    if(error){
        res.status(400).send(error.message)
        return
    }

    usuario.nombre = value.nombre
    res.send(usuario)
})

app.delete('/api/usuarios/:id', (req, res) => {
    let usuario = existeUsuario(req.params.id)
    if(!usuario){
        res.status(404).send('El usuario no fue encontrado')
        return
    } 

    const index = usuarios.indexOf(usuario)
    usuarios.splice(index, 1)

    res.send(usuarios)
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Escuchando en el puerto ${port}...`);
})

function existeUsuario(id) {
    return(usuarios.find(u => u.id === parseInt(id)))
}

function validarUsuario(nom) {
    const schema = Joi.object({
        nombre: Joi.string() 
            .min(3)
            .max(30)
            .required()
    })
    return (schema.validate({ nombre: nom }))
}

