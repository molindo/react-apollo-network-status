import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLNonNull
} from 'graphql';

const db = {
  user: {
    id: '1',
    name: 'Jane'
  }
};

const User = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: {type: GraphQLID},
    name: {type: GraphQLString}
  }
});

const UserInput = new GraphQLInputObjectType({
  name: 'UserInput',
  fields: {
    name: {type: GraphQLString}
  }
});

function respond<T>(result: T): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(result), 300));
}

export default new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      user: {
        type: User,
        args: {
          id: {type: new GraphQLNonNull(GraphQLID)}
        },
        resolve: () => respond(db.user)
      }
    }
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      updateUser: {
        type: User,
        args: {
          id: {type: new GraphQLNonNull(GraphQLID)},
          user: {type: UserInput}
        },
        resolve: (_, {user}) => respond(Object.assign(db.user, user))
      }
    }
  })
});
