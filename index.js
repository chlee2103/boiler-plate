const express = require('express')  //express 모듈을 가져온다
const app = express()
const port = 5000

const mongoose = require('mongoose')
mongoose
    .connect('mongodb+srv://plum:0uDaDoVWgvgGOxXn@cluster0.w7ux2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {})
    .then(() => console.log('MongoDB connect....'))
    .catch(err => console.log(err))

// respond with "hello world" when a GET request is made to the homepage
app.get('/', (req, res) => {
  res.send('hello world 안녕하세요')
})

// 

app.listen(port, () => console.log('Example app listening on port ${port}!') )  // 터미널 로그 찍기 