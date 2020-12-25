import { PrismaClient } from '@prisma/client'
import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import fs from 'fs'
import path from 'path'

import Query from './resolvers/Query'
import Books from './resolvers/Books'

const app = express()

const resolvers = {
    Query,
    Books,
}

const prisma = new PrismaClient()

const server = new ApolloServer({
    typeDefs: fs.readFileSync(
        path.join(__dirname, 'schema.graphql'),
        'utf8'
    ),
    resolvers,
    context: {
        prisma,
    }
})

server.applyMiddleware({app})

app.listen({port: 4000}, () => {
    console.log(`Server listening at http://localhost:4000${server.graphqlPath}`)
})