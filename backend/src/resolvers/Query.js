const { forwardTo } = require('prisma-binding')

const Query = {
  items: forwardTo('db')
  // async DataTransferItemList(parent, args, ctx, info) {
  //   console.log('Getting items!')
  //   const items = await ctx.db.query.items()
  //   return items
  // }

}

module.exports = Query
