if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

var express = require('express');
var router = express.Router();
const Cart = require('../models/cart');
const Product = require('../models/product');
const User = require('../models/user');
const bodyParser = require('body-parser');
router.use(bodyParser.json());
const Order = require('../models/order');
const Payment = require('../models/payment');
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)
const {
  blockUserMiddleware,
  checkAuthenticated
} = require('../middleware/auth')
const paypal = require("@paypal/checkout-server-sdk")
const Environment =
  process.env.NODE_ENV === "production" ?
  paypal.core.LiveEnvironment :
  paypal.core.SandboxEnvironment
const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_CLIENT_SECRET
  )
)



/* GET home page. */

router.get('/shipping', checkAuthenticated, async (req, res, next) => {
  const userId = req.user._id;
  try {
      const user = await User.findById(userId);
      res.render('checkout/shipping', {
          indexUrl: req.session.indexUrl,
          user: user,
      });
  } catch (error) {
      console.error('Error fetching user:', error);
      res.redirect('/checkout/cart');
  }
});


router.post('/shipping', async (req, res, next) => {
  try {
      const {
          shipAddress,
          billAddress
      } = req.body;


      const userId = req.user._id;

      // Find the user by ID
      const user = await User.findById(userId);

      if (!user) {
          return res.status(404).json({
              message: "User not found"
          });
      }

      // Find the shipping address by ID
      const sessionshipAddress = user.addresses.find((address) => address._id.toString() === shipAddress);

      if (!sessionshipAddress) {
          return res.status(404).json({
              message: "Shipping address not found"
          });
      }

      // Store the found shipping address in the session (you can customize this based on your session setup)
      req.session.shipAddress = sessionshipAddress;

      if (billAddress == undefined) {
          req.session.billAddress = sessionshipAddress;
      } else {
          const sessionbillAddress = user.addresses.find((address) => address._id.toString() === billAddress);

          req.session.billAddress = sessionbillAddress;
      }

      res.redirect('/checkout/payment')
  } catch (error) {
      console.error("Error during shipping checkout:", error);
      res.status(500).json({
          message: "Internal server error"
      });
  }
})


router.get('/payment', (req, res, next) => {
  res.render('checkout/payment', {
      indexUrl: req.session.indexUrl,
  });
});


router.post('/payment', (req, res, next) => {
  try {
      const {
          paymethod
      } = req.body;
      req.session.paymentMethod = paymethod;
      res.redirect('/checkout/confirmation')
  } catch (error) {
      res.redirect('/checkout/payment')
  }
});

router.get('/confirmation', async (req, res, next) => {
  try {
      const userId = req.user._id;
      const user = await User.findOne(userId).populate('wallet.transactions').exec();
      const cart = await Cart.findOne({
          user_id: userId
      }).populate('items.product');
      const shipAddress = req.session.shipAddress;
      const billAddress = req.session.billAddress;
      const paymethod = req.session.paymentMethod;

      res.render('checkout/confirmation', {
          indexUrl: req.session.indexUrl,
          user: user,
          ship: shipAddress,
          bill: billAddress,
          paymethod: paymethod,
          cart: cart,
          paypalClientId: process.env.PAYPAL_CLIENT_ID,
      });
  } catch (error) {
      console.log(error);
      res.redirect('/checkout/failed')
  }
});



router.get('/updateProducts', async (req, res, next) => {
  try {
      function generateRandomCode() {
          const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
          const randomLetter = letters[Math.floor(Math.random() * letters.length)];
          const randomNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
          return randomLetter + randomNumber;
      }

      
        const userId = req.user._id;

        const user = await User.findOne(userId).populate('wallet.transactions').exec();
        
      

      const randomCode = generateRandomCode();
      const shipAddress = req.session.shipAddress;

      const fname = shipAddress.fname;
      const lname = shipAddress.lname;

      const paymethod = req.session.paymentMethod;
      const cart = await Cart.findOne({
          user_id: userId
      }).populate('items.product');


      let newTrack = [
        {
          status: 'done',
          note: 'Order Placed',
        },
        {
          status: 'pending',
          note: 'Estimated Shipping',
          created_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        {
          status: 'end',
          note: 'Estimated Delivery',
          created_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 7 days from the previous status
        },
      ];

      let amount = cart.total;
      let currStatus;
      if (paymethod == 'cod') {
          currStatus = 'Pending'
      } else {
          currStatus = 'Success'
      }
      

      const newOrder = new Order({
          orderNo: randomCode,
          paymentMethod: req.session.paymentMethod,
          track: newTrack,
          user_id: userId,
          cart: cart,
          shippingAddress: shipAddress,
          billingAddress: shipAddress,
      })

      await newOrder.save();

      const newPayment = new Payment({
          fname: fname,
          lname: lname,
          orderNo: randomCode,
          order: newOrder,
          paymentMethod: paymethod,
          amount: amount,
          status: currStatus,
      })

      await newPayment.save();



        if (user && user.wallet && user.wallet.balance !== undefined) {
            let newAmount = user.wallet.balance - req.session.newBalance;

            user.wallet.transactions.push({
                amount: -newAmount,
                transactionType: 'Debited to Purchase',
                operation: 'Withdrawal',
              });

        user.wallet.balance = req.session.newBalance;
        await user.save();
        } 


      res.redirect('/checkout/saveorder');
  } catch (error) {
      console.log(error);
      res.redirect('/checkout/fail')
  }
});



router.get('/saveorder', async (req, res) => {
  try {
      const userId = req.user._id;

      ;

      // Find the cart by user_id
      const cart = await Cart.findOne({
          user_id: userId
      });

      console.log(cart);

      if (!cart) {
          return res.status(404).json({
              message: 'Cart not found'
          });
      }

      // Loop through items in the cart
      for (const item of cart.items) {
          const product = await Product.findById(item.product);

          if (!product) {
              continue; // Move to the next item if product not found
          }

          // Update product stock and total stock
          const sizeIndex = product.sizes.findIndex(size => size.sizeName === item.size);
          if (sizeIndex !== -1) {
              product.sizes[sizeIndex].stock -= item.quantity;
              product.totalStock -= item.quantity;
              await product.save();
          }
      }

      await cart.deleteOne();

      res.render('checkout/save', {
          indexUrl: req.session.indexUrl,
      })
  } catch (error) {
      console.error(error);
      return res.status(500).json({
          message: 'Error updating products and cart'
      });
  }
});




router.post("/payment-stripe", async (req, res) => {
  try {
      const user_id = req.user._id;
      const wallet = req.body.wallet;
      const cents = req.body.price;
      let newBalance;
      
      console.log(wallet);

    const user = await User.findOne(user_id).populate('wallet.transactions').exec();
    let currBalance ;

    if (user && user.wallet && user.wallet.balance !== undefined) {
        currBalance = user.wallet.balance;
      } else {
        currBalance = 0;
      }
      

      // Fetch the cart for the user
      const cart = await Cart.findOne({
          user_id
      }).populate('items.product');

      if (!cart) {
          throw new Error("Cart not found for the user.");
      }

// Initialize total quantity
    let totalQuantity = 0;

    // Calculate total quantity
    for (const cartItem of cart.items) {
      totalQuantity += cartItem.quantity;
    }

    const tax = 110;
    let discount;
    let price = cents*100;
    let newPrice;

    console.log(discount);
    console.log(price);

    console.log('cent:', cents);
    console.log('currBalance:', currBalance);
    
    if (wallet == true) {
        
    

    if(cents < currBalance) {
        newBalance = currBalance - cents;
        discount = price / totalQuantity;
    }

    if(cents > currBalance) {
        newBalance = 0;
        newPrice = currBalance*100
        discount = newPrice / totalQuantity;
    }

} else {
    discount = 0;
    newBalance = currBalance;
}

    console.log('newBalance:', newBalance);
    console.log('fDiscount:', discount);
    console.log('new Price:', newPrice);

    console.log(newPrice);
    console.log(newBalance);


    req.session.newBalance = newBalance;

    const session = await stripe.checkout.sessions.create({

        payment_method_types: ["card"],
        mode: "payment",
        discounts: [
            {
                coupon: 'MIRAGE500',
            },
        ],
        line_items: cart.items.map(cartItem => {
            const product = cartItem.product;
            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: product.name,
                    },
                    unit_amount: cartItem.product.price * 100, // Make sure it's in cents
                },
                quantity: cartItem.quantity,
            };
        }),
        success_url: `${process.env.CLIENT_URL}/checkout/updateProducts`,
        cancel_url: `${process.env.CLIENT_URL}/checkout/confirmation`,
    });
    
    
    

      res.json({
          url: session.url
      });
    } catch (e) {
        console.error("Error:", e);
        res.status(500).json({
            error: e.message
        });
     }
     
});




router.post("/paypal-order", async (req, res) => {
  const userId = req.user.id; // Assuming you have user authentication in place

  try {
      const cart = await Cart.findOne({
          user_id: userId
      }).populate("items.product");

      if (!cart) {
          return res.status(400).json({
              error: "Cart not found"
          });
      }

      const request = new paypal.orders.OrdersCreateRequest();

      const totalWithoutTax = cart.items.reduce((sum, cartItem) => {
          return sum + cartItem.product.price * cartItem.quantity;
      }, 0);

      const totalTax = totalWithoutTax * 0.1; // 10% tax
      const total = totalWithoutTax + totalTax;

      request.prefer("return=representation");
      request.requestBody({
          intent: "CAPTURE",
          purchase_units: [{
              amount: {
                  currency_code: "USD",
                  value: total,
                  breakdown: {
                      item_total: {
                          currency_code: "USD",
                          value: totalWithoutTax,
                      },
                      tax_total: {
                          currency_code: "USD",
                          value: totalTax,
                      },
                  },
              },
              items: cart.items.map(cartItem => ({
                  name: cartItem.product.name,
                  unit_amount: {
                      currency_code: "USD",
                      value: cartItem.product.price,
                  },
                  quantity: cartItem.quantity,
              })),
          }, ],
      });

      const order = await paypalClient.execute(request);
      res.json({
          id: order.result.id
      });
  } catch (e) {
      res.status(500).json({
          error: e.message
      });
      console.log(e);
  }
});




router.get('/cartsave', checkAuthenticated, async (req, res) => {
  try {
      // Retrieve the cart items from the session
      const sessionCart = req.session.cart || [];

      // Create a new Cart document based on the session cart
      const cart = new Cart({
          user_id: req.user.id, // Assuming you have user authentication and req.user is available
          items: sessionCart,
          total_items: req.session.totalItems || 0,
          subtotal: req.session.cartSubtotal || 0,
          tax: req.session.cartTax || 0,
          total: req.session.cartTotal || 0,
      });

      // Save the cart to the database
      await cart.save();

      // Clear the session cart since it's now saved in the database
      req.session.cart = [];
      req.session.totalItems = 0;
      req.session.cartSubtotal = 0;
      req.session.cartTax = 0;
      req.session.cartTotal = 0;

      res.redirect('/checkout'); // Redirect to a success page
  } catch (error) {
      console.error('Error saving cart to database:', error);
      res.status(500).send('An error occurred while processing the checkout.');
  }
});


// router.get('/cart', checkAuthenticated, async (req, res, next) => {
//   const userId = req.user.id;
//   try {
//     let cart = await Cart.findOne({ user_id: userId }).populate('items.product');

//     res.render('cart.ejs', { cart: cart });
//   } catch (error) {
//     console.error('Error rendering cart:', error);
//     res.status(500).send('An Error getting User ID.');
//   }
// });

router.get('/cart',checkAuthenticated, async (req, res, next) => {
  try {
      const sessionCart = req.session.cart || [];
      const auth = req.user;

      if (auth) {
          const userId = req.user._id;
          nullCart = null;
          const cart = await Cart.findOne({
              user_id: userId
          }).populate('items.product');

          // Calculate the total price using the items array in the cart


          res.render('checkout/cart.ejs', {
              cart: cart,
              sessionCart: nullCart,
              indexUrl: req.session.indexUrl
          });
      } else {
          // Calculate the total price using the session cart
          const totalPrice = sessionCart.reduce((acc, item) => {
              return acc + item.total;
          }, 0);

          res.render('checkout/cart.ejs', {
              sessionCart: sessionCart,
              totalPrice: totalPrice,
              indexUrl: req.session.indexUrl,
          });
      }
  } catch (error) {
      console.error('Error rendering cart:', error);
      res.status(500).send('An error occurred while getting cart items from the session.');
  }
});


// ////////////


// Add item to the cart
router.post('/cart/add',checkAuthenticated, async (req, res) => {

  try {
    console.log(req.session.authCart);

      if (req.session.authCart == 'closed' || req.session.authCart == undefined) {

          const {
              productId,
              quantity,
              productName
          } = req.body;

          // Get the product details (Replace this with your actual product retrieval code)
          const product = await Product.findById(productId);

          if (!product) {
              return res.status(404).send('Product not found');
          }

          const price = product.price;
          const subtotal = price * quantity;
          const tax = subtotal * 0.1; // Assuming tax is 10% of the subtotal
          const total = Math.floor(subtotal + tax);

          // Check if the cart already exists in the session
          if (!req.session.cart) {
              req.session.cart = [];
          }

          // Check if the product is already in the cart
          const existingItemIndex = req.session.cart.findIndex(item => item.product === productId);

          if (existingItemIndex !== -1) {
              // Increment the quantity of the existing item
              req.session.cart[existingItemIndex].quantity += Number(quantity); // Convert to number
              req.session.cart[existingItemIndex].subtotal += subtotal;
          } else {
              // Create a new cart item
              const newItem = {
                  name: productName,
                  product: productId,
                  quantity: Number(quantity), // Convert to number
                  price: price,
                  subtotal: subtotal,
                  total: total,
              };

              // Add the new item to the cart
              req.session.cart.push(newItem);
          }

          // Update the cart values in the session
          req.session.cartSubtotal = (req.session.cartSubtotal || 0) + subtotal;
          req.session.cartTax = (req.session.cartTax || 0) + tax;
          req.session.cartTotal = (req.session.cartTotal || 0) + total;
          req.session.totalItems = (req.session.totalItems || 0) + Number(quantity); // Convert to number

          res.redirect('/');

      } else {

          const {
              userId,
              productId,
              quantity,
              size
          } = req.body;


          // Get the product details
          const product = await Product.findById(productId);

          if (!product) {
              return res.status(404).json({
                  error: 'Product not found'
              });
          }

          // Calculate cart values based on the product and quantity
          const price = product.price;
          const subtotal = price * quantity;
          const tax = subtotal * 0.1; // Assuming tax is 10% of the subtotal
          const total = subtotal + tax;

          // Find the user's cart or create a new cart if it doesn't exist
          let cart = await Cart.findOne({
              user_id: userId
          });
          if (!cart) {
              cart = new Cart({
                  user_id: userId,
                  items: [],
                  subtotal: 0,
                  tax: 0,
                  total: 0,
                  total_items: 0, // Initialize total_items to 0
              });
          }

          // Check if the product already exists in the cart
          const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId && item.size === size);
          if (existingItemIndex !== -1) {
              // If the product with the same size already exists, update the existing item's quantity
              cart.items[existingItemIndex].quantity++;
              cart.items[existingItemIndex].subtotal += subtotal;
              cart.items[existingItemIndex].total += total;
          } else {
              // Create a new cart item
              const newItem = {
                  product: productId,
                  size: size, // Include the "size" property
                  quantity: quantity,
                  price: price,
                  subtotal: subtotal,
                  total: total,
              };
              cart.items.push(newItem);
          }

          // Calculate the total quantity of all items in the cart
          const totalQuantity = cart.items.reduce((acc, item) => acc + item.quantity, 0);
          cart.total_items = totalQuantity;

          // Update the cart totals
          cart.subtotal += subtotal;
          cart.tax += tax;
          cart.total += total;

          // Save the cart to the database
          await cart.save();

          res.redirect('/checkout/cart');

      }

  } catch (error) {
      console.error('Error adding item to cart:', error);
      res.status(500).send('An error occurred while adding item to cart.');
  }
});


// /////////////////

router.post('/cart/:id/remove', async (req, res) => {
  try {

      if (req.session.authCart == 'closed' || req.session.authCart == undefined) {

          const {
              productId
          } = req.params;
          const cart = req.session.cart || [];

          // Find the index of the item in the cart
          const itemIndex = cart.findIndex(item => item.product === productId);

          if (itemIndex !== -1) {
              const removedItem = cart.splice(itemIndex, 1)[0];

              // Update session variables for cart
              req.session.cart = cart;
              req.session.cartSubtotal -= removedItem.subtotal;
              req.session.cartTax -= removedItem.subtotal * 0.1; // Update tax accordingly
              req.session.cartTotal -= removedItem.subtotal * 1.1; // Update total accordingly
              req.session.subtotalItems -= removedItem.quantity;
          }

          res.redirect('/checkout/cart');

      } else {



          const itemId = req.params.id;

          // Find the cart that contains the item to be removed
          const cart = await Cart.findOne({
              'items._id': itemId
          });

          if (!cart) {
              return res.status(404).json({
                  error: 'Item not found in the cart'
              });
          }

          // Find the index of the item to be removed within the cart's items array
          const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);

          if (itemIndex === -1) {
              return res.status(404).json({
                  error: 'Item not found in the cart'
              });
          }

          // Get the item being removed for later calculations
          const removedItem = cart.items[itemIndex];

          // Remove the item from the cart's items array
          cart.items.splice(itemIndex, 1);

          // Update the cart's subtotal_items, total, tax, and subtotal based on the removed item
          cart.total_items -= removedItem.quantity;
          cart.subtotal -= removedItem.subtotal;
          cart.tax -= removedItem.subtotal * 0.1; // Assuming tax is 10% of the removed item's subtotal
          cart.total -= removedItem.total;

          // Save the updated cart to the database
          await cart.save();

          res.redirect('/checkout/cart');

      }

  } catch (error) {
      console.error('Error removing item from cart:', error);
      res.status(500).json({
          error: 'An error occurred while removing item from cart'
      });
  }
});


router.post('/count', async (req, res) => {
  const {
      action,
      itemId
  } = req.body;
  console.log('Received request:', req.body)

  if (action && itemId) {
      try {
          const cart = await Cart.findOne({
              'items._id': itemId
          }).populate('items.product');

          if (!cart) {
              return res.status(404).json({
                  error: 'Item not found in cart'
              });
          }

          const item = cart.items.find(item => item._id.toString() === itemId);

          if (!item) {
              return res.status(404).json({
                  error: 'Item not found in cart'
              });
          }

          const quantityChange = action === 'increment' ? 1 : -1;

          // Update item quantity and related properties
          item.quantity += quantityChange;
          item.subtotal = item.quantity * item.product.price;
          item.total = item.subtotal;

          // Update cart properties based on the item changes
          const totalQuantity = cart.items.reduce((acc, item) => acc + item.quantity, 0);
          cart.total_items = totalQuantity;

          // Recalculate cart subtotal, tax, and total
          cart.subtotal = cart.items.reduce((total, cartItem) => total + cartItem.subtotal, 0);
          cart.tax = cart.subtotal * 0.1; // Assuming 10% tax
          cart.total = cart.subtotal + cart.tax;

          await cart.save();

          res.redirect('/checkout/cart');
      } catch (error) {
          console.error('Error updating item quantity:', error);
          res.status(500).send('An error occurred while updating item quantity.');
      }
  } else {
      return res.status(400).json({
          error: 'Invalid request parameters'
      });
  }
});




// Add item to the cart
// router.post('/cart/add', async (req, res) => {
//   try {
//     const { productId, quantity, productName } = req.body;

//     // Get the product details (Replace this with your actual product retrieval code)
//     const product = await Product.findById(productId);

//     if (!product) {
//       return res.status(404).send('Product not found');
//     }

//     const price = product.price;
//     const subtotal = price * quantity;
//     const tax = subtotal * 0.1; // Assuming tax is 10% of the subtotal
//     const total = Math.floor(subtotal + tax);

//     // Check if the cart already exists in the session
//     if (!req.session.cart) {
//       req.session.cart = [];
//     }

//     // Check if the product is already in the cart
//     const existingItemIndex = req.session.cart.findIndex(item => item.product === productId);

//     if (existingItemIndex !== -1) {
//       // Increment the quantity of the existing item
//       req.session.cart[existingItemIndex].quantity += Number(quantity); // Convert to number
//       req.session.cart[existingItemIndex].subtotal += subtotal;
//     } else {
//       // Create a new cart item
//       const newItem = {
//         name: productName,
//         product: productId,
//         quantity: Number(quantity), // Convert to number
//         price: price,
//         subtotal: subtotal,
//         total: total,
//       };

//       // Add the new item to the cart
//       req.session.cart.push(newItem);
//     }

//     // Update the cart values in the session
//     req.session.cartSubtotal = (req.session.cartSubtotal || 0) + subtotal;
//     req.session.cartTax = (req.session.cartTax || 0) + tax;
//     req.session.cartTotal = (req.session.cartTotal || 0) + total;
//     req.session.totalItems = (req.session.totalItems || 0) + Number(quantity); // Convert to number

//     res.redirect('/checkout/cart');
//   } catch (error) {
//     console.error('Error adding item to cart:', error);
//     res.status(500).send('An error occurred while adding item to cart.');
//   }
// });

// // Remove item from cart
// router.post('/cart/:productId/remove', async (req, res) => {
//   try {
//     const { productId } = req.params;
//     const cart = req.session.cart || [];

//     // Find the index of the item in the cart
//     const itemIndex = cart.findIndex(item => item.product === productId);

//     if (itemIndex !== -1) {
//       const removedItem = cart.splice(itemIndex, 1)[0];

//       // Update session variables for cart
//       req.session.cart = cart;
//       req.session.cartSubtotal -= removedItem.subtotal;
//       req.session.cartTax -= removedItem.subtotal * 0.1; // Update tax accordingly
//       req.session.cartTotal -= removedItem.subtotal * 1.1; // Update total accordingly
//       req.session.subtotalItems -= removedItem.quantity;
//     }

//     res.redirect('/checkout/cart');
//   } catch (error) {
//     console.error('Error removing item from cart:', error);
//     res.status(500).send('An error occurred while removing item from cart.');
//   }
// });



module.exports = router;