import { QueryResolvers } from '../../generated/graphql';
import { Context } from '../server';

export const Query: QueryResolvers<Context> = {
  async book(_, { id }, { dataSources }) {
    return dataSources.books.getBook(id);
  },
};
