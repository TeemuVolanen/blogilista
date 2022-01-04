const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
// Lisättiin nämä testit ja jutut
const bcrypt = require('bcrypt')
const User = require('../models/user')

describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'testiMies',
      name: 'Mies Testaaja',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
})

//describe lohkot? blogeja on jo olemassa, tietyn blogin tarkastelu, blogin lisäys, blogin poisto

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs
    .map(b => new Blog(b))
  const promiseArray = blogObjects.map(b => b.save())
  await Promise.all(promiseArray)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('blogs id field is named id', async () => {
  const blogs = await helper.blogsInDb()
  blogs.map(b => {
    let idFieldName = (Object.keys(b)[4] === 'id')
      ? Object.keys(b)[4]
      : undefined
    expect(idFieldName).toBeDefined()
  })

  const badBlogs = [
    {
      'title': 'Testi blogi3',
      'author': 'Tero Testaaja',
      'url': 'https://testi.fi/3',
      'likes': 123,
      '_id': 0
    }
  ]
  badBlogs.map(b => {
    let idFieldName = (Object.keys(b)[4] === 'id')
      ? Object.keys(b)[4]
      : undefined
    expect(idFieldName).toBe(undefined)
  })

})

test('a valid blog can be added ', async () => {
  const newBlog = {
    'title': 'Testi blogi3',
    'author': 'Tero Testaaja',
    'url': 'https://testi.fi/3',
    'likes': 123,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

  const titles = blogsAtEnd.map(b => b.title)
  expect(titles).toContain(
    'Testi blogi3'
  )
})

test('likes value is 0 if no value is given', async () => {
  const newBlog = {
    'title': 'Testi blogi3',
    'author': 'Tero Testaaja',
    'url': 'https://testi.fi/3',
    'likes': null
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()

  expect(blogsAtEnd[helper.initialBlogs.length].likes).toEqual(0)
})

test('invalid blog cannot be added ', async () => {
  const newBlog = {
    'author': 'Tero Testaaja',
    'likes': 123,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
    .expect('Content-Type', /application\/json/)
})

test('a blog can be deleted ', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)
})

test('a blog can be updated (liked) ', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToBeLiked = blogsAtStart[0]
  let newLikes = blogToBeLiked.likes + 1

  const newBlog = {
    'title': blogToBeLiked.title,
    'author': blogToBeLiked.author,
    'url': blogToBeLiked.url,
    'likes': newLikes,
  }

  await api
    .put(`/api/blogs/${blogToBeLiked.id}`)
    .send(newBlog)
    .expect(200)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd[0].likes).toEqual(helper.initialBlogs[0].likes + 1)
})

afterAll(() => {
  mongoose.connection.close()
})