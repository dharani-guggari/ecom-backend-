const Cart = require("../models/cart");
const Product = require("../models/Product");

// Add to cart
const addToCart = async (req, res, next) => {
  try {
    // Get productId and quantity from request body
    const { productId, quantity } = req.body;

    // Get userId from request (assuming user is authenticated and userId is available)
    const userId = req.user._id;

    // Validate productId
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Find or create cart for the user
    let cart = await Cart.findOne({ userId });

    // If cart does not exist, create a new one
    if (!cart) {
      cart = new Cart({
        userId,
        products: [
          {
            productId,
            quantity: quantity || 1,
          },
        ],
        totalPrice: product.price * (quantity || 1),
      });
    } else {
      // If cart exists, check if product is already in the cart
      const prodIndex = cart.products.findIndex(
        (item) => item.productId.toString() === productId
      );

      // If product is already in the cart, update quantity
      if (prodIndex > -1) {
        cart.products[prodIndex].quantity += quantity || 1;
      } else {
        // If product is not in the cart, add it
        cart.products.push({ productId, quantity: quantity || 1 });
      }

      // Recalculate total price
      cart.totalPrice = await calculateTotalPrice(cart.products);
    }

    // Save the cart
    await cart.save();

    // Return the updated cart
    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// Get cart
const getCart = async (req, res, next) => {
  try {
    // Get userId from request
    const userId = req.user._id;

    // Find the cart for the user and populate product details with title, price, and image
    let cart = await Cart.findOne({ userId }).populate(
      "products.productId",
      "title price image"
    );

    // If cart does not exist, create a new one
    if (!cart) {
      cart = new Cart({
        userId,
        products: [],
        totalPrice: 0,
      });
      await cart.save();
    }

    // Return the cart
    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

const clearCart = async (req, res, next) => {
  try {
    // Get userId from request
    const userId = req.user._id;

    // Find the cart for the user
    const cart = await Cart.findOne({ userId });

    // If cart does not exist, return a message
    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }
    cart.products = []; // Clear products
    cart.totalPrice = 0; // Reset total price
    await cart.save(); // Save the updated cart

    // Return success message
    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

const updateQuantity = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity <= 1) {
      return re.status(400).json({
        message: "Invalid productId or quantity",
      });
    }
    // Find the cart for the user
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    const proIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (proIndex === -1) {
      return res.status(404).json({
        message: "Product not found in cart",
      });
    }
    // Update the quantity of the product
    cart.products[proIndex].quantity = quantity;
    // Recalculate total price
    cart.totalPrice = await calculateTotalPrice(cart.products);
    // Save the updated cart
    await cart.save();
    // Return the updated cart
    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        message: "Product ID is required",
      });
    }

    // Find the cart for the user
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    // Find the index of the product to be removed
    const productIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({
        message: "Product not found in cart",
      });
    }

    // Remove the product from the cart
    cart.products.splice(productIndex, 1);

    // Recalculate total price
    cart.totalPrice = await calculateTotalPrice(cart.products);

    // Save the updated cart
    await cart.save();

    // Return the updated cart
    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};
// Helper to calculate total price
async function calculateTotalPrice(products) {
  let total = 0;
  for (const item of products) {
    // Fetch product details to get the price
    const product = await Product.findById(item.productId);

    // If product exists, calculate total
    if (product) {
      total += product.price * item.quantity;
    }
  }
  return total;
}
module.exports = {
  addToCart,
  getCart,
  clearCart,
  updateQuantity,
  removeFromCart,
};
