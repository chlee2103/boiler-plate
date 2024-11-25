const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const util = require('util')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastName: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

// user 정보를 저장하기 전
userSchema.pre('save', async function( next ) {
    var user = this;    // userSchema를 가르킨다.
 
    if(user.isModified('password')) {
        bcrypt.genSalt(10, function(err, salt) {
            if (err) {
                return next(err);
            }

            bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                return next();
            });
        });
    }
    else {
        return next();
    }
})

// 비밀번호 비교
userSchema.methods.comparePassword = function(plainPassword) {
    // 암호화된 비밀번호와 같은지 체크
    const user = this;
    return bcrypt.compare(plainPassword, this.password)
}

// jsonwebtoken을 이용해서 token 생성하기
userSchema.methods.generateToken = function() {
    user = this;
    const token = jwt.sign(user._id.toJSON(), 'secretToken');
    user.token = token;

    return user.save();
}

userSchema.statics.findByToken = function(token) {
    const user = this;

    return util.promisify(jwt.verify)(token, 'secretToken')
        .then((decoded) => {
            console.log(decoded);
            return user.findOne({
                "_id": decoded,
                "token": token
            });
        })
        .catch((err) => {
            console.log(err);
            throw new Error("유효하지 않은 토큰입니다.");
        });
}

const User = mongoose.model('User', userSchema);    // model에 감싸기
module.exports = {User}                             // module화
