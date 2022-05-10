const mongoose = require('mongoose');

// schema
const postSchema = mongoose.Schema({ // Post의 schema는 title, body, author, createdAt, updatedAt으로 구성이 되어 있습니다.
  title:{type:String, required:[true,'Title is required!']},
  body:{type:String, required:[true,'Body is required!']},
  author:{type:mongoose.Schema.Types.ObjectId, ref:'user', required:true},
  createdAt:{type:Date, default:Date.now}, // default 항목으로 기본 값을 지정할 수 있습니다. 함수명을 넣으면 해당 함수의 return이 기본값이 됩니다.
  updatedAt:{type:Date},
});

// model & export
const Post = mongoose.model('post', postSchema);
module.exports = Post;