import express from 'express';
import hbs from 'hbs'
import path from 'path'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import fileUpload from 'express-fileupload'
import fs from 'fs'

import {initDatabase, initTable, insertProduct, getProduct} from './database.js'
import { UV_FS_O_FILEMAP } from 'constants';

const __dirname = path.resolve()


const app = express()
const db = initDatabase()
initTable(db)

app.set('views', __dirname + '/layouts')
app.set('view engine', 'html')
app.engine('html', hbs.__express)

//use file parser
app.use(fileUpload())

//log income request
app.use(morgan('combined'))

//parse request body
app.use(bodyParser.urlencoded())

//serve static file
app.use('/assets', express.static(__dirname + '/assets'))
app.use('/files', express.static(__dirname + '/files'))

app.get('/', (req, res, next)=>{
    res.send({success: true})
})

//get product list
app.get('/product', async(req, res, next)=> {
    // getProduct(db).then(product => {
    //     console.log('product result :',product)
    //     res.render('product')
    // }).catch(error => {
    //     console.error(error)
    // })

    let products
    try {
        products = await getProduct(db)
    } catch (errorr) {
        return next(error)
    }
    //console.log('Product Result', product)
    res.render ('product', {products})       
})

//handle form get method
app.get('/add-product', (req, res, next) => {
    res.send(req.query)
})

//handle form post method
app.post('/add-product', (req, res, next) => {
    console.log('Request', req.body)
    console.log('File', req.files)
    //const fileName = req.files.photo.name

    //getfilename
    const fileName = Date.now() + req.files.photo.name

    fs.writeFile(path.join(__dirname, '/files', fileName), req.files.photo.data, (err) => {
        if (err){
            console.error(err)
            return
        }
    })
    insertProduct(db, req.body.name, parseInt(req.body.price), `/files/${fileName}`)
    
    //redirect
    res.redirect('/product')
    //res.send(req.body) -- menampilkan data

})

app.use((err, req, res, next) =>{
    res.send(err.message)
})

app.listen(8000, () => {
    console.log('app listen on port 8000')
})