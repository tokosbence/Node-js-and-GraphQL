const express = require("express");
const app = express();
const mongoose = require("mongoose");
const PORT = 5000;
const { graphqlHTTP } = require("express-graphql");
const schema = require("./Schemas");
const isAuth = require("./middleware/auth");

mongoose
  .connect("mongodb://127.0.0.1/GraphQLExample")
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error("Could not connect to MongoDB..."));

app.use(isAuth);

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

app.listen(PORT, () => {
  console.log("Server running");
});
