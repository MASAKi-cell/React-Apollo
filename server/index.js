const { ApolloServer, ApolloError } = require('apollo-server');
const typeDefs = require('./schema/schema');
const { createStore } = require('./utils');
const { LaunchAPI } = require('./datasources/launch');
const { UserAPI } = require('./datasources/user');
const resolvers = require('./resolvers');

const store = createStore();

const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => ({
        // resolverのcontext引数を通してUserAPIとLaunchAPIにアクセス可能
        launchAPI: new LaunchAPI(),
        userAPI: new UserAPI({ store })
    })
});

server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
})