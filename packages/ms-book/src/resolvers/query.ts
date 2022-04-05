import { QueryResolvers } from '../../generated/graphql';
import { Context } from '../server';

export const Query: QueryResolvers<Context> = {
  async book(_, { id }, { dataSources }) {
    // await dataSources.books.createBook({authorId: '1', publisherId: '1', id: '12', name: 'awesom book', status: BOOKSTATUS.introduced })
    return dataSources.books.getBook(id);
  },
};
