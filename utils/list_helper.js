const dummy = (blogs) => {
  console.log(blogs)
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, item) => {
    return sum + item.likes
  }
  return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length < 1) {
    return [{}]
  } else {
    var mostLikes = blogs[0]
    blogs.map(b => {
      if (b.likes > mostLikes.likes) mostLikes = b
    })
    return [mostLikes]
  }
}

module.exports = {
  dummy, totalLikes, favoriteBlog
}