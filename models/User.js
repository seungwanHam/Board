const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// schema
const userSchema = mongoose.Schema({
  username:{
    type:String,
    required:[true,'사용자 명은 필수입니다.'],
    match:[/^.{3,12}$/,'3글자 이상 12글자 이하 문자로 입력바랍니다.'],
    trim:true,
    unique:true
  },
  password:{
    type:String,
    required:[true,'비밀번호는 필수입니다.'],
    select:false
  },
  name:{
    type:String,
    required:[true,'이름은 필수입니다.'],
    match:[/^.{4,12}$/,'3글자 이상 12글자 이하 문자로 입력바랍니다.'],
    trim:true
  },
  email:{
    type:String,
    match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,'유효하지 않은 이메일 입니다.'],
    trim:true
  }
},{
  toObject:{virtuals:true}
});

// virtuals
userSchema.virtual('passwordConfirmation')
  .get(function(){ return this._passwordConfirmation; })
  .set(function(value){ this._passwordConfirmation=value; });

userSchema.virtual('originalPassword')
  .get(function(){ return this._originalPassword; })
  .set(function(value){ this._originalPassword=value; });

userSchema.virtual('currentPassword')
  .get(function(){ return this._currentPassword; })
  .set(function(value){ this._currentPassword=value; });

userSchema.virtual('newPassword')
  .get(function(){ return this._newPassword; })
  .set(function(value){ this._newPassword=value; });

// password validation
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
const passwordRegexErrorMessage = '영문과 숫자의 조합으로 최소 8자 이상이어야 합니다.';
userSchema.path('password').validate(function(v) {
  var user = this;

  // create user
  if(user.isNew){
    if(!user.passwordConfirmation){
      user.invalidate('비밀번호 확인', '비밀번호 확인이 필요합니다.');
    }

    if(!passwordRegex.test(user.password)){
      user.invalidate('password', passwordRegexErrorMessage);
    }
    else if(user.password !== user.passwordConfirmation) {
      user.invalidate('비밀번호 확인', '비밀번호가 일치하지 않습니다.');
    }
  }

  // update user
  if(!user.isNew){
    if(!user.currentPassword){
      user.invalidate('현재 비밀번호', '현재 비밀번호가 필요합니다.');
    }
    else if(!bcrypt.compareSync(user.currentPassword, user.originalPassword)){
      user.invalidate('현재 비밀번호', '현재 비밀번호가 잘못되었습니다.');
    }

    if(user.newPassword && !passwordRegex.test(user.newPassword)){
      user.invalidate("새 비밀번호", passwordRegexErrorMessage);
    }
    else if(user.newPassword !== user.passwordConfirmation) {
      user.invalidate('비밀번호 확인', '비밀번호 확인이 일치하지 않습니다.');
    }
  }
});

// hash password
userSchema.pre('save', function (next){
  var user = this;
  if(!user.isModified('password')){
    return next();
  }
  else {
    user.password = bcrypt.hashSync(user.password);
    return next();
  }
});

// model methods
userSchema.methods.authenticate = function (password) {
  var user = this;
  return bcrypt.compareSync(password,user.password);
};

// model & export
const User = mongoose.model('user',userSchema);
module.exports = User;