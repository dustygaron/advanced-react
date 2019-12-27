const Mutations = {

  async createItem(parent, args, ctx, info) {
    // Todo: check if they are logged in

    const item = await ctx.db.mutation.creatItem({
      data: {
        ...args
      }
    }, info)

    console.log(item)
    return item
  }
  // createDog(parent, args, ctx, info) {
  //   global.dogs = global.dogs || []
  //   const newDog = { name: args.name }
  //   global.dogs.push(newDog)
  //   console.log(args)
  // }
}

module.exports = Mutations
