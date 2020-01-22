const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { randomBytes } = require('crypto')
const { promisify } = require('util')
const { transport, makeANiceEmail } = require('../mail')
const { hasPermission } = require('../utils')
const stripe = require('../stripe')

const Mutations = {

  // CREATE ITEM ------------------------------------------------
  async createItem(parent, args, ctx, info) {

    // Check if they are logged in
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to do that.')
    }

    const item = await ctx.db.mutation.createItem({
      data: {
        // Create relationship between item and user
        user: {
          connect: {
            id: ctx.request.userId
          },
        },
        ...args
      }
    }, info)

    console.log(item)
    return item
  },

  // UPDATE ITEM ------------------------------------------------
  updateItem(parent, args, ctx, info) {

    // Take a copy of the updates
    const updates = { ...args }

    // Remove the ID from the updates
    delete updates.id

    // Run the update method
    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id
        },
      },
      info
    )
  },

  // DELETE ITEM ------------------------------------------------
  async deleteItem(parent, args, ctx, info) {

    const where = { id: args.id }

    // Find the item
    const item = await ctx.db.query.item({ where }, `{ id title user {id}}`)

    // Check if they own item or have the permissions
    const ownsItem = item.user.id === ctx.request.userId
    const hasPermissions = ctx.request.user.permissions.some(permission =>
      ['ADMIN', 'ITEMDELETE'].includes(permission)
    )

    if (!ownsItem || !hasPermissions) {
      throw new Error("You don't have permission to do that!")
    }

    // Delete it!
    return ctx.db.mutation.deleteItem({ where }, info)
  },

  // SIGNUP  ------------------------------------------------
  async signup(parent, args, ctx, info) {

    args.email = args.email.toLowerCase()

    // Hash password
    const password = await bcrypt.hash(args.password, 10)

    // Create user in DB
    const user = await ctx.db.mutation.createUser({
      data: {
        ...args,
        password,
        permissions: { set: ['USER'] }
      }
    }, info)

    // Create JWT Token for them
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)

    // Set JWT as a cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    })
    return user
  },

  // SIGN IN  ------------------------------------------------
  async signin(parent, { email, password }, ctx, info) {

    // Check if there is a user with that email
    const user = await ctx.db.query.user({ where: { email } })
    if (!user) {
      throw new Error(`No such user found for email ${email}`)
    }

    // Check if their password is correct
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      throw new Error('Invalid Password!')
    }

    // Ggenerate the JWT Token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)

    // Set the cookie with the token
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    })

    // Return the user
    return user
  },

  // SIGN OUT  ------------------------------------------------
  signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token')
    return { message: 'Goodbye!!' }
  },

  // REQUEST RESET --------------------------------------------
  async requestReset(parent, args, ctx, info) {

    // Check if this is a real user
    const user = await ctx.db.query.user({ where: { email: args.email } })
    if (!user) {
      throw new Error(`No such user found for email ${args.email}`)
    }

    // Set a reset token and expiry on that user
    const randomBytesPromiseified = promisify(randomBytes)
    const resetToken = (await randomBytesPromiseified(20)).toString('hex')
    const resetTokenExpiry = Date.now() + 360000 // 1 hour from now
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry },
    })

    // Email them that reset token
    const mailRes = await transport.sendMail({
      from: 'email@myemail.com',
      to: user.email,
      subject: 'Your password reset token',
      html: makeANiceEmail(`Your password reset token is here!
      \n\n
      <a href ='${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}'>
        Click here to reset </a> `),
    })
    // Return the message
    return { message: 'Woohoo it worked!' }
  },

  // RESET PASSWORD ---------------------------------------------
  async resetPassword(parent, args, ctx, info) {

    // Check if the passwords match
    if (args.password !== args.confirmPassword) {
      throw new Error("Yo Passwords don't match!")
    }
    // Check if its a legit reset token
    // Check if its expired
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000,
      },
    })
    if (!user) {
      throw new Error('This token is either invalid or expired!')
    }
    // Hash their new password
    const password = await bcrypt.hash(args.password, 10)
    // Save the new password to the user and remove old resetToken fields
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })
    // Generate JWT
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET)
    // Set the JWT cookie
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    })
    // Return the new user
    return updatedUser
  },

  // UPDATE PERMISSIONS ------------------------------------------------
  async updatePermissions(parent, args, ctx, info) {

    // Check if they are logged in
    if (!ctx.request.userId) {
      throw new Error('You must be logged in!')
    }
    // Query the current user
    const currentUser = await ctx.db.query.user(
      {
        where: {
          id: ctx.request.userId,
        },
      },
      info
    )
    // Check if they have permissions to do this
    hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE'])
    // Update the permissions
    return ctx.db.mutation.updateUser(
      {
        data: {
          permissions: {
            set: args.permissions,
          },
        },
        where: {
          id: args.userId,
        },
      },
      info
    )
  },

  // ADD TO CART ------------------------------------------------
  async addToCart(parent, args, ctx, info) {
    // Make sure they are logged in
    const { userId } = ctx.request
    if (!userId) {
      throw new Error('You must be logged in!')
    }

    // Query user's cart
    const [existingCartItem] = await ctx.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: args.id },
      },
    })

    // Check if that item is already in their cart and increment by 1 if it is
    if (existingCartItem) {
      console.log('This item is already in your cart')
      return ctx.db.mutation.updateCartItem(
        {
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + 1 },
        },
        info
      )
    }

    // If its not, create a fresh CartItem for that user
    return ctx.db.mutation.createCartItem(
      {
        data: {
          user: {
            connect: { id: userId },
          },
          item: {
            connect: { id: args.id },
          },
        },
      },
      info
    )
  },

  // DELETE ITEM ------------------------------------------------
  async removeFromCart(parent, args, ctx, info) {
    // Find cart item
    const cartItem = await ctx.db.query.cartItem(
      {
        where: {
          id: args.id,
        },
      },
      `{id, user {id}}`
    )

    // Make sure we found item
    if (!cartItem) throw new Error('No cart item found.')

    // Make sure they own that cart item
    if (cartItem.user.id !== ctx.request.userId) {
      throw new Error('You cannot delete that.')
    }

    // Delete the item
    return ctx.db.mutation.deleteCartItem({
      where: { id: args.id }
    }, info)

  },

  // CREATE ORDER ------------------------------------------------
  async createOrder(parent, args, ctx, info) {
    // Query the current user and make sure they are signed in
    const { userId } = ctx.request
    if (!userId) throw new Error('You must be signed in to complete this order.')

    const user = await ctx.db.query.user(
      { where: { id: userId } },
      `{
        id
        name
        email
        cart {
          id
          quantity
          item {title price id description image}
        }
      }`
    )

    // Recalculate the total for the price
    const amount = user.cart.reduce(
      (tally, cartItem) => tally + cartItem.item.price * cartItem.quantity, 0
    )
    console.log(`Going to charge for a total ${amount}`)

    // Create the stripe charge
    const charge = await stripe.charges.create({
      amount,
      currency: 'USD',
      source: args.token
    })

    // Convert the CartItems to OrderItems
    // Create the order
    // Clean up - clear the user's cart, delete cartItems
    // Return the order to the client

  }

}

module.exports = Mutations
