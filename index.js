const express = require('express')  //express 모듈을 가져온다
const app = express()
const port = 5000
const bodyParser = require('body-parser');

const config = require('./config/key');

const { User } = require("./models/User"); 

// application/x-www-form-urlencoded 를 분석해서 가져올 수 있게 해주는 세팅
app.use(bodyParser.urlencoded({extended: true}));

// application/json 을 분석해서 가져올 수 있게 해주는 세팅
app.use(bodyParser.json());



const mongoose = require('mongoose')
mongoose
    .connect(config.mongoURI, {})
    .then(() => console.log('MongoDB connect....'))
    .catch(err => console.log(err))

// respond with "hello world" when a GET request is made to the homepage
app.get('/', (req, res) => {
  res.send('hello world')
})

app.post('/register', async (req, res) => {
    // 회원가입 정보들을 client에서 가져오면 그것들을 db에 넣어준다.

    // req.body 안에는 json이 들어있음. > body-parser가 파싱해줌
    const user = new User(req.body)

    //mongoDB 메서드, user모델에 저장
    const result = await user.save().then(()=>{
        res.status(200).json({ success: true })
    }).catch((err)=>{
        res.json({ success: false, err })
    })
})



app.listen(port, () => console.log(`Example app listening on port ${port}!`) )  // 터미널 로그 찍기 