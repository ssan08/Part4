const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const listHelper = require('../utils/list_helper')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const app = require('../app')

const api = supertest(app)


const Blog = require('../models/blog')


  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('1234', 10)
    const user = new User({ username: 'ss1', passwordHash })

    await user.save()

    const passwordHash1 = await bcrypt.hash('5678', 10)
    const user1 = new User({ username: 'ss2', passwordHash })

    await user1.save()


  })



 

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await listHelper.usersInDb()

    const newUser = {
      username: 'ss3',
      name: 'sangita3',
      password: 'sang',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await listHelper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })



const initialBlogs = [
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7
  },
  {
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5
  },
]

beforeEach(async () => {
  await Blog.deleteMany({})

  let blogObject = new Blog(initialBlogs[0])
  await blogObject.save()

  blogObject = new Blog(initialBlogs[1])
  await blogObject.save()
})

test('blogs returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
  const res = await api.get('/api/blogs')
  expect(res.body.length).toEqual(initialBlogs.length)
})


test('ID defined', async () => {

  const blogs = await listHelper.blogsInDb()
  expect(blogs[0].id).toBeDefined()
})

test('a valid blog can be added', async () => {

  const user2 = await User.findOne({ username: 'ss1' })
  
  const userForToken = {
    username: 'ss1',
    id: user2._id,
  }

  const token = jwt.sign(userForToken, process.env.SECRET)
  const authkey =  `Bearer ${token}`

  const newBlog = {
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12
  }

  await api
    .post('/api/blogs')
    .set('Authorization',authkey) 
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)
  const res = await api.get('/api/blogs')
  expect(res.body.length).toEqual(initialBlogs.length + 1)
})



test('like missing', async () => {

  const user2 = await User.findOne({ username: 'ss1' })
  
  const userForToken = {
    username: 'ss1',
    id: user2._id,
  }

  const token = jwt.sign(userForToken, process.env.SECRET)
  const authkey =  `Bearer ${token}`

  const newBlog = {

    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll"
  }
  res = await api
    .post('/api/blogs')
    .set('Authorization',authkey) 
    .send(newBlog)
    .expect('Content-Type', /application\/json/)
  
  expect(res.body.likes).toEqual(0)
})


test('title/url missing', async () => {

  const user2 = await User.findOne({ username: 'ss1' })
  
  const userForToken = {
    username: 'ss1',
    id: user2._id,
  }

  const token = jwt.sign(userForToken, process.env.SECRET)
  const authkey =  `Bearer ${token}`

  const newBlog = {

    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes:10
  }
  const newBlog1 = {
    title: 'First class tests',
    author: "Robert C. Martin",
    likes:10
  }
   await api
    .post('/api/blogs')
    .set('Authorization',authkey) 
    .send(newBlog)
    .expect(400)

    await api
    .post('/api/blogs')
    .set('Authorization',authkey) 
    .send(newBlog1)
    .expect(400)
})


test('Password length validation', async () => {
  const newUser = {
    "username": "ss3",
    "name":"sangita2",
    "password": "12"
}

  await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
})

test('Username length validation', async () => {
  const newUser = {
    "username": "ss",
    "name":"sangita2",
    "password": "1244"
}

  await api
    .post('/api/users')
    .send(newUser)
    .expect(500)
})

test('Username existence validation', async () => {
  const newUser = {
    "name":"sangita2",
    "password": "1244"
}

  await api
    .post('/api/users')
    .send(newUser)
    .expect(500)
})

test('Password existence validation', async () => {
  const newUser = {
    "username": "ss3",
    "name":"sangita2"
}

  await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
})

test('Token missing', async () => {

  const newBlog = {

    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 15
  }
  res = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)
})



afterAll(() => {
  mongoose.connection.close()
})

