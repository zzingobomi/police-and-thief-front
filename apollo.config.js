module.exports = {
  client: {
    includes: ["./src/**/*.tsx"],
    tagName: "gql",
    service: {
      name: "police-and-thief-backend",
      url: "http://localhost:7100/graphql",
    },
  },
};
