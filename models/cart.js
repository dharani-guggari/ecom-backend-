const mongoose = require("mongoose");
const cartShcema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
    },
  ],

  totalPrice: {
    type: Number,
    required: true,
    default: 0,
  },
});
const Cart = mongoose.model("Cart", cartShcema);

module.exports = Cart;
