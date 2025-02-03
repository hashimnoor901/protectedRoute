const express = require('express')
const userModel = require('./models/user')
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const app = express()
app.set('view engine','ejs')
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(cookieParser())

function isLogedIn(req,res,next){
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send('You need to login first');
  }   else{
 let data = 
     jwt.verify(req.cookies.token,'hashim')
     req.user = data
     next()
   }
}

app.get('/',(req,res)=>{
  res.render('index')
})
app.get('/login',(req,res)=>{
  res.render('login')
})
app.get('/logout',(req,res)=>{
  res.cookie('token','')
  res.redirect('/login')
})
app.get('/profile',isLogedIn,(req,res)=>{
  res.render('login')
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
app.post('/login', isLogedIn,
   async (req,res)=>{
  const {password,email} = req.body
 const user = await userModel.findOne({email})
 if(!user) return res.status(500).send('something went wrong')
  bcrypt.compare(password,user.password,async (err,result)=>{
    if(result) {
      const token =await jwt.sign({email:email,userid:user._id},'hashim')
    res.cookie("token",token)
    res.status(200).send('you can login')

    }
      else res.redirect('/login')
  })
})

app.listen(3000)
console.log(`listning`);
