const graphql = require("graphql");
const { GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLFloat } = graphql;

const ProductType = new GraphQLObjectType({
  name: "Product",
  fields: () => ({
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
  }),
});

module.exports = ProductType;
