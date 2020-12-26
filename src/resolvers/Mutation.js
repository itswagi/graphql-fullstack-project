import { ApolloError } from 'apollo-server-express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
const { APP_SECRET, getUserId } = require('../utils')

async function signup(parent, args, context, info) {
    const password = await bcrypt.hash(args.password, 10)
  
    const user = await context.prisma.readers.create({ data: { ...args, password } })
  
    const token = jwt.sign({ userId: user.id }, APP_SECRET)
  
    return {
      token,
      user,
    }
  }
  
  async function login(parent, args, context, info) {
    const user = await context.prisma.readers.findUnique({ where: { email: args.email } })
    if (!user) {
      throw new Error('No such user found')
    }
  
    const valid = await bcrypt.compare(args.password, user.password)
    if (!valid) {
      throw new Error('Invalid password')
    }
  
    const token = jwt.sign({ userId: user.id }, APP_SECRET)

    return {
      token,
      user,
    }
}
  

const createBook = async (parent, args, context, info) => {
    const { userId } = context

    return await context.prisma.books.create({
        data: {
            title: args.title,
            price: args.price,
            quantity: args.quantity,
            publisher: {
                connect: {
                    id: args.publisher_id
                }
            }
        }
    })
}

const updateBook = async (parent, args, context, info) => {
    try{
        const {isbn, publisher_id, ...values} = args

        if(!isbn) 
            throw new ApolloError("Missing ISBN value")

        if(publisher_id)
            values.publisher = { connect: { id: publisher_id}}

        if(Object.keys(values).length === 0)
            throw new ApolloError("Missing attributes")

        return await context.prisma.books.update({
            where: {
                isbn: isbn
            },
            data: values
        })
    } catch(err){
        //console.log(err.meta.details.split(":")[1])
        return err
    }
}

const deleteBook = async (parent, args, context, info) => {
    try{
        if(!args.isbn)
            throw new ApolloError('Missing ISBN value')
        return await context.prisma.books.delete({
            where: {
                isbn: args.isbn
            }
        })
    } catch(err){
        return err
    }
}

export default {
    signup,
    login,
    createBook,
    updateBook,
    deleteBook,
}