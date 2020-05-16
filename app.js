const express = require('express')
const jwt = require('jsonwebtoken')
const app = express()
const blogsRouter = require('express').Router()
const usersRouter = require('./controllers/users')
const User = require('./models/user')
const cors = require('cors')
const mongoose = require('mongoose')
const logger = require('./utils/logger')
const loginRouter = require('./controllers/login')
const config = require('./utils/config')
const middleware = require('./utils/middleware')
const Blog = require('./models/blog')



mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connection to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.json())



app.use(middleware.tokenExtractor)

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs.map(blog => blog.toJSON()))
})

blogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)
  let d = 1
  if (request.token) {
    jwt.verify(request.token, process.env.SECRET, function (err, decoded) {
      if (err) {
        err = {
          name: 'JsonWebTokenError',
          message: 'token invalid or missing'
        }
        return response.status(401).json(err)
      }
      else {
        d = 0
      }

    })
  }
  else {
    err = {
      name: 'JsonWebTokenError',
      message: 'token invalid or missing'
    }
    return response.status(401).json(err)

  }

  if (d == 0) {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    const user = await User.findById(decodedToken.id)

    blog.user = user._id
    if (!blog.likes) {
      blog.likes = 0
    }
    if (!blog.title || !blog.url) {
      response.status(400).json(blog)
    }
    else {

      const savedblog = await blog.save()
      user.blogs = user.blogs.concat(savedblog)
      await user.save()

      response.status(201).json(savedblog.toJSON())
    }
  }

})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await blog.findById(request.params.id)
  if (blog) {
    response.json(blog.toJSON())
  } else {
    response.status(404).end()
  }
})

blogsRouter.put('/:id', (request, response, next) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  }

  Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    .then(updatedblog => {
      response.json(updatedblog.toJSON())
    })
    .catch(error => next(error))
})

blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

module.exports = app
