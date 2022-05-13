const mongoose = require('mongoose');
const Counter = require('./Counter');

// schema
const postSchema = mongoose.Schema({
  title:{type:String, required:[true,'제목은 필수입니다.']},
  body:{type:String, required:[true,'본문은 필수입니다.']},
  author:{type:mongoose.Schema.Types.ObjectId, ref:'user', required:true},
  views:{type:Number, default:0},
  numId:{type:Number},
  attachment:{type:mongoose.Schema.Types.ObjectId, ref:'file'},
  createdAt:{type:Date, default:Date.now},
  updatedAt:{type:Date},
});

postSchema.pre('save', async function (next){
  var post = this;
  if(post.isNew){
    counter = await Counter.findOne({name:'posts'}).exec();
    if(!counter) counter = await Counter.create({name:'posts'});
    counter.count++;
    counter.save();
    post.numId = counter.count;
  }
  return next();
});

// model & export
const Post = mongoose.model('post', postSchema);
module.exports = Post;