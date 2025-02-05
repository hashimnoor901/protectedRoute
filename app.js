const express = require('express')
const userModel = require('./models/user')
const postModel = require('./models/post')
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const app = express()
app.set('view engine','ejs')
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(cookieParser())

const isLogedIn = (req,res,next)=>{
  // const token = req.cookies.token;
  if(req.cookies.token ==='') res.redirect('/login')
   else{
 let data = 
     jwt.verify(req.cookies.token,'hashim')
     req.user = data
     next()
   }
}

app.get('/',(req,res)=>{
  res.render('index')
})
app.get('/login',isLogedIn,(req,res)=>{
  res.render('login')
})
app.get('/logout',(req,res)=>{
  res.cookie('token','')
  res.redirect('/login')
})
app.get('/profile',isLogedIn,async (req,res)=>{
  let user = await userModel.findOne({email:req.user.email}).populate("posts")
  
   res.render('profile',{user})
})
app.post('/post',isLogedIn,async (req,res)=>{
  let user = await userModel.findOne({email:req.user.email})
  let {content} = req.body
 let post = await postModel.create({
    user:user._id,
    content:content,
  })
  user.posts.push(post._id)
  await user.save()
  res.redirect('/profile')
})
app.post('/register',async (req,res)=>{
  const {user,username,password,email,age} = req.body
 const userExist = await userModel.findOne({email})
 if(userExist) return res.status(500).send('user already register')

  bcrypt.genSalt(10,(err,salt)=>{
    bcrypt.hash(password,salt,async (err,hash)=>{
      const newUser = await userModel.create({
        user,
        username,
        password,
        email,
        password:hash
      })      
      const token = jwt.sign({email:email,userid:newUser._id},'hashim')
      res.cookie("token",token)
      res.send(newUser)
    })    
})
})
app.post('/login', 
   async (req,res)=>{
  const {password,email} = req.body
 const user = await userModel.findOne({email})
 if(!user) return res.status(500).send('something went wrong')
  bcrypt.compare(password,user.password,  (err,result)=>{
    if(result) {
      const token =  jwt.sign({email:email,userid:user._id},'hashim')
    res.cookie("token",token)
    res.status(200).redirect('/profile')

    }
      else res.redirect('/login')
  })
})

app.listen(3000)
console.log(`listning`);
