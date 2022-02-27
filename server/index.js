const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schema/schema');
const { createStore } = require('./utils');
const resolvers = require('./resolvers');
const LaunchAPI = require('./datasources/launch');
const UserAPI = require('./datasources/user');
const isEmail = require('isemail'); // Emailのバリデーションチェック

const store = createStore();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    launchAPI: new LaunchAPI(),
    userAPI: new UserAPI({ store })
  }),
  context: async ({req}) => {
    const auth = req.headers && req.headers.authorization || '';
    const email = Buffer.from(auth, 'base64').toString('ascii');

    if(!isEmail.validate(email)) {
      return { user: null }
    }

    // Requestに含まれるAuthorization headerをチェック、その情報を元にデータベースを検索
    // 存在すれば、そのユーザーをcontextに渡す
    const users = await store.users.findOrCreate({ where: { email } });
    const user = users && users[0] || [];

    return { user: {...user.dataValues}}
  }
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});