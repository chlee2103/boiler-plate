const express = require('express')  //express 모듈을 가져온다
const app = express()
const port = 5000
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const config = require('./config/key');

const { auth } = require("./middlewore/auth"); 
const { User } = require("./models/User"); 

// application/x-www-form-urlencoded 를 분석해서 가져올 수 있게 해주는 세팅
app.use(bodyParser.urlencoded({extended: true}));

// application/json 을 분석해서 가져올 수 있게 해주는 세팅
app.use(bodyParser.json());

app.use(cookieParser());


const mongoose = require('mongoose')
mongoose
    .connect(config.mongoURI, {})
    .then(() => console.log('MongoDB connect....'))
    .catch(err => console.log(err))

// respond with "hello world" when a GET request is made to the homepage
app.get('/', (req, res) => {
  res.send('hello world')
})

// register router
app.post('/api/users/register', async (req, res) => {
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

app.post('/api/users/login', (req, res) => {
    // 요청된 이메일을 데이터베이스에서 있는지 찾는다.
    User.findOne({email: req.body.email})
    .then(async (user) =>{
        if(!user) {
            throw new Error("제공된 이메일에 해당하는 유저가 없습니다.")
        }

        const isMatch = await user.comparePassword(req.body.password);
        return { isMatch, user };
    })
    .then(({ isMatch, user }) => {
        console.log(isMatch);
        if (!isMatch) {
            throw new Error("비밀번호가 틀렸습니다.")
        }
        // 로그인 완료
        return user.generateToken();
    })
    .then ((user) => {
        // 토큰 저장 (쿠키, localstorage ...)
        return res.cookie("x_auth", user.token)
        .status(200)
        .json({
            loginSuccess: true,
            userId: user._id
        });
    })
    .catch ((err) => {
        console.log(err);
        return res.status(400).json({
            loginSuccess: false,
            message: err.message
        });
    })
});


app.get("/api/users/auth", auth, (req, res) => {
    // 여기까지 통과했다면 Authentication == true
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })
})

// 로그아웃 > token 제거
app.post('/api/users/logout', auth, (req, res) => {
    User.findOneAndUpdate({
        _id: req.user._id
    }, {
        token: ""
    })
    .then(() => {
        return res.status(200).json({
            logoutSuccess: true
        });
    })
    .catch((err) => {
        return res.status(400).json({
            logoutSuccess: false,
            message: err.message
        });
    })
})


app.listen(port, () => console.log(`Example app listening on port ${port}!`) )  // 터미널 로그 찍기 