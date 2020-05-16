const User = require('../models/user')
const Blog = require('../models/blog')
const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    let sum = 0
    for (let index = 0; index < blogs.length; index++) {
        sum = sum + blogs[index].likes;

    }
    return sum
}


const favoriteBlog = (blogs) => {
    let max = blogs[0].likes
    let i = 0
    for (let index = 0; index < blogs.length; index++) {
        if (blogs[index].likes > max) {
            max = blogs[index].likes
            i = index
        }

    }
    const fav = {
        title: blogs[i].title,
        author: blogs[i].author,
        likes: blogs[i].likes
    }
    return fav
}

const mostBlogs = (blogs) => {
    var auth = []
    for (let i = 0; i < blogs.length; i++) {
        if (blogs[i]) {
            let a = blogs[i].author
            let count = 0
            for (let j = 0; j < blogs.length; j++) {
                if (blogs[j]) {
                    if (blogs[i].author == blogs[j].author) {
                        count = count + 1
                        if (i != j) {
                            delete blogs[j]
                        }

                    }
                }


            }
            auth = auth.concat({ author: a, blogs: count })
            if (blogs[i]) {
                delete blogs[i]
            }

        }


    }
    let max = auth[0].blogs
    let i = 0
    for (let index = 0; index < auth.length; index++) {
        if (auth[index].blogs > max) {
            max = auth[index].blogs
            i = index
        }

    }
    const fav = {
        author: auth[i].author,
        blogs: auth[i].blogs
    }
    return fav
}

const mostLikes = (blogs) => {
    var auth = []
    for (let i = 0; i < blogs.length; i++) {
        if (blogs[i]) {
            let a = blogs[i].author
            let count = blogs[i].likes
            for (let j = 0; j < blogs.length; j++) {
                if (blogs[j]) {
                    if (i != j && blogs[i].author == blogs[j].author) {
                        count = count + blogs[j].likes

                        delete blogs[j]


                    }
                }


            }
            auth = auth.concat({ author: a, likes: count })
            if (blogs[i]) {
                delete blogs[i]
            }

        }


    }
    let max = auth[0].likes
    let i = 0
    for (let index = 0; index < auth.length; index++) {
        if (auth[index].likes > max) {
            max = auth[index].likes
            i = index
        }

    }
    const fav = {
        author: auth[i].author,
        likes: auth[i].likes
    }
    return fav
}


const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(b => b.toJSON())
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes,
    usersInDb,
    blogsInDb
}
