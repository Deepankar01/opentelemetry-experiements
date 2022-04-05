import { QueryResolvers } from '../../generated/graphql';
import { DataSources } from '../server';

export const Query: QueryResolvers<DataSources> = {
    async book (_, {id}, {books}) {
        return books.getBook(id);
    },
  };