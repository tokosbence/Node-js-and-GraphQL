// Import necessary GraphQL modules and dependencies.
const graphql = require("graphql");
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLFloat,
  GraphQLList,
} = graphql;

//Import bcrypt
const bcrypt = require("bcrypt");

// Import data models for products and orders.
const { Product } = require("../models/products");
const { Order } = require("../models/orders");
const { User } = require("../models/users");

// Import user-defined data types for GraphQL.
const ProductType = require("./TypeDefs/ProductType");
const UserType = require("./TypeDefs/UserType");
const OrderType = require("./TypeDefs/OrderType");

// Define the RootQuery, which is the entry point for querying data.
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    // Products Queries
    getAllProduct: {
      type: new GraphQLList(ProductType), // Define the type of data to be returned (a list of products).
      args: { id: { type: GraphQLString } }, // Specify any input arguments that can be used in the query (in this case, an 'id').
      async resolve(parent, args) {
        // The 'resolve' function specifies how to fetch and return the requested data.
        // In this case, it fetches and returns a list of all products.
        const productList = await Product.find();
        return productList;
      },
    },
    getProduct: {
      type: ProductType, // Define the type of data to be returned (a single product).
      args: { id: { type: GraphQLString } }, // Specify an input argument 'id'.
      async resolve(parent, args) {
        // The 'resolve' function fetches and returns a specific product based on the provided 'id'.
        const product = await Product.findById(args.id);
        return product;
      },
    },

    // Orders Queries
    getAllOrders: {
      type: new GraphQLList(OrderType), // Define the type of data to be returned (a list of orders).
      args: { id: { type: GraphQLString } }, // Specify an input argument 'id'.
      async resolve(parent, args, req) {
        // The 'resolve' function fetches and returns a list of orders for a specific user, but only if the user is authenticated.
        if (!req.isAuth) {
          throw new Error("Unauthenticated");
        }
        const orderList = await Order.find({ userId: args.id });
        return orderList;
      },
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    //Product mutations
    createProduct: {
      type: ProductType,
      args: {
        brand: { type: GraphQLString },
        category: { type: GraphQLString },
        description: { type: GraphQLString },
        discountPercentage: { type: GraphQLFloat },
        images: { type: GraphQLString },
        price: { type: GraphQLFloat },
        rating: { type: GraphQLFloat },
        stock: { type: GraphQLInt },
        thumbnail: { type: GraphQLString },
        title: { type: GraphQLString },
      },
      async resolve(parent, args, req) {
        const newProduct = new Product({
          title: args.title,
          brand: args.brand,
          category: args.category,
          description: args.description,
          discountPercentage: args.discountPercentage,
          images: args.images,
          price: args.price,
          rating: args.rating,
          stock: args.stock,
          thumbnail: args.thumbnail,
        });

        await newProduct.save();

        return newProduct;
      },
    },

    updateProduct: {
      type: ProductType,
      args: {
        id: { type: GraphQLString },
        brand: { type: GraphQLString },
        category: { type: GraphQLString },
        description: { type: GraphQLString },
        discountPercentage: { type: GraphQLFloat },
        images: { type: GraphQLString },
        price: { type: GraphQLFloat },
        rating: { type: GraphQLFloat },
        stock: { type: GraphQLInt },
        thumbnail: { type: GraphQLString },
        title: { type: GraphQLString },
      },
      async resolve(parent, args, req) {
        const newProduct = await Product.findByIdAndUpdate(args.id, {
          brand: args.brand,
          category: args.category,
          description: args.description,
          discountPercentage: args.discountPercentage,
          images: args.images,
          price: args.price,
          rating: args.rating,
          stock: args.stock,
          thumbnail: args.thumbnail,
          title: args.title,
        });

        return newProduct;
      },
    },

    deleteProduct: {
      type: ProductType,
      args: {
        id: { type: GraphQLString },
      },
      async resolve(parent, args) {
        console.log(args.id);

        const deletedProduct = await Product.findByIdAndDelete(args.id);

        return args;
      },
    },

    //Users mutations
    createUser: {
      type: GraphQLString,
      args: {
        username: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        isAdmin: { type: graphql.GraphQLBoolean },
      },
      async resolve(parent, args) {
        console.log(args);
        const newUser = new User({
          username: args.username,
          email: args.email,
          password: args.password,
          isAdmin: args.isAdmin,
        });

        const user = await User.findOne({ email: newUser.email });
        if (user) {
          throw new Error("Already in db");
        }

        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(newUser.password, salt);

        await newUser.save();
        const token = newUser.generateAuthToken();

        const data = {
          token: token,
          id: newUser.id,
          isAdmin: newUser.isAdmin,
        };
        return JSON.stringify(data);
      },
    },

    loginUser: {
      type: GraphQLString,
      args: {
        email: { type: GraphQLString },
        password: { type: GraphQLString },
      },
      async resolve(parent, args) {
        const user = await User.findOne({ email: args.email });
        if (!user) {
          throw new Error("Not user with that email");
        }
        const validPassword = await bcrypt.compare(
          args.password,
          user.password
        );

        if (!validPassword) {
          throw new Error("Invalid password");
        }
        const token = user.generateAuthToken();
        const data = {
          token: token,
          userId: user.id,
          isAdmin: user.isAdmin,
        };
        return JSON.stringify(data);
      },
    },

    //Orders mutation
    createOrder: {
      type: GraphQLString,
      args: {
        userId: { type: GraphQLString },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        address: { type: GraphQLString },
        city: { type: GraphQLString },
        country: { type: GraphQLString },
        zipCode: { type: GraphQLString },
        totalAmount: { type: GraphQLFloat },
        items: { type: GraphQLString },
      },
      async resolve(parent, args, req) {
        console.log(args);
        const newOrder = new Order({
          userId: args.userId,
          firstName: args.firstName,
          lastName: args.lastName,
          address: args.address,
          city: args.city,
          country: args.country,
          zipCode: args.zipCode,
          totalAmount: args.totalAmount,
          items: args.items,
          createdDate: new Date().toLocaleDateString(),
        });

        await newOrder.save();
        const data = {
          message: "success",
        };

        return JSON.stringify(data);
      },
    },
  },
});

// Export a GraphQLSchema that includes the RootQuery.
module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
