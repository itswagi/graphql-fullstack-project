const book = async (parent, args, context) => {
    return context.prisma.books.findMany()
}

export default {
    book
}