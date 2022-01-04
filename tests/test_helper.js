const Blog = require('../models/blog')
const User = require('../models/user') // Tää lisätty

const initialBlogs = [
  {
    'title': 'Testi blogi',
    'author': 'Tero Testaaja',
    'url': 'https://testi.fi',
    'likes': 123,
    'id': '61b5f9c92168c91e0cf97e43'
  },
  {
    'title': 'Testi blogi2',
    'author': 'Tero Testaaja',
    'url': 'https://testi.fi/2',
    'likes': 123,
    'id': '61b607197d3e3b88ecf6676e'
  }
]

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(b => b.toJSON())
}

const usersInDb = async () => { // Tää lisätty
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  initialBlogs, blogsInDb, usersInDb
}