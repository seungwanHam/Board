const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// schema // 1
const userSchema = mongoose.Schema({
  username:{
    type:String,
    required:[true,'Username is required!'],
    match:[/^.{4,12}$/,'Should be 4-12 characters!'],
    trim:true,
    unique:true
  },
  password:{
    type:String,
    required:[true,'Password is required!'],
    select:false
  },
  name:{
    type:String,
    required:[true,'Name is required!'],
    match:[/^.{4,12}$/,'Should be 4-12 characters!'],
    trim:true
  },
  email:{
    type:String,
    match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,'Should be a vaild email address!'],
    trim:true
  }
},{
  toObject:{virtuals:true}
});

// virtuals
// DB에 저장되는 값 이외의 항목이 필요할 땐 virtual 항목으로 만듭니다. 즉 passwordConfirmation, originalPassword, currentPassword, newPassword는 회원가입, 회원정보 수정을 위해 필요한 항목이지만, DB에 저장할 필요는 없는 값들입니다. 이처럼 DB에 저장될 필요는 없지만, model에서 사용하고 싶은 항목들은 virtual로 만듭니다.
userSchema.virtual('passwordConfirmation')
  .get(function () { return this._passwordConfirmation; })
  .set(function (value) { this._passwordConfirmation = value; });

userSchema.virtual('originalPassword')
  .get(function () { return this._originalPassword; })
  .set(function (value) { this._originalPassword = value; });

userSchema.virtual('currentPassword')
  .get(function () { return this._currentPassword; })
  .set(function (value) { this._currentPassword = value; });

userSchema.virtual('newPassword')
  .get(function () { return this._newPassword; })
  .set(function (value) { this._newPassword = value; });

// password validation
// password를 DB에 생성, 수정하기 전에 값이 유효(valid)한지 확인(validate)을 하는 코드를 작성합니다.
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
const passwordRegexErrorMessage = 'Should be minimum 8 characters of alphabet and number combination!';
userSchema.path('password').validate(function(v) {
  var user = this; // validation callback 함수 속에서 this는 user model입니다. 헷갈리지 않도록 user 변수에 넣었습니다.

  // create user
  // 회원가입의 경우 password confirmation값이 없는 경우와, password값이 password confirmation값과 다른 경우에 유효하지않음처리(invalidate)를 하게 됩니다. model.invalidate함수를 사용하며, 첫번째는 인자로 항목이름, 두번째 인자로 에러메세지를 받습니다.
  if (user.isNew) { // model.isNew 항목은 해당 모델이 생성되는 경우에는 true, 아니면 false의 값을 가집니다. 이 항목을 이용해서 현재 password validation이 '회원가입' 단계인지, 아니면 '회원 정보 수정'단계인지를 알 수 있습니다.
    if(!user.passwordConfirmation){
      user.invalidate('passwordConfirmation', 'Password Confirmation is required.');
    }
    if(!passwordRegex.test(user.password)){
      user.invalidate('password', passwordRegexErrorMessage);
    }
    else if(user.password !== user.passwordConfirmation) {
      user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!');
    }
  }

  // update user
  // 회원 정보 수정의 경우 current password값이 없는 경우와, current password값이 original password값과 다른 경우, new password값과 password confirmation값이 다른 경우 invalidate합시다. 회원정보 수정시에는 항상 비밀번호를 수정하는 것은 아니기 때문에 new password와 password confirmation값이 없어도 에러는 아닙니다.
  if(!user.isNew){
    if(!user.currentPassword){
      user.invalidate('currentPassword', 'Current Password is required!');
    }
    else if(!bcrypt.compareSync(user.currentPassword, user.originalPassword)){
      user.invalidate('currentPassword', 'Current Password is invalid!');
    }

    if(user.newPassword && !passwordRegex.test(user.newPassword)){
      user.invalidate("newPassword", passwordRegexErrorMessage);
    }
    else if(user.newPassword !== user.passwordConfirmation) {
      user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!');
    }
  }
});

// hash password
userSchema.pre('save', function (next) {
  var user = this;
  if (!user.isModified('password')) { // 3-1
    return next();
  }
  else {
    user.password = bcrypt.hashSync(user.password); //3-2
    return next();
  }
});

// model methods
userSchema.methods.authenticate = function (password) {
  var user = this;
  return bcrypt.compareSync(password, user.password);
};

// model & export
const User = mongoose.model('user', userSchema);
module.exports = User;