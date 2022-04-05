import { QueryResolvers } from '../../generated/graphql';
import { Context } from '../server';
import axios from 'axios';
const callEndpoint = async () => {
  const config = {
    method: 'get',
    url: 'https://reqres.in/api/users?page=2',
    headers: { }
  };
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const response = await axios(config);
  return response;
}





export const Query: QueryResolvers<Context> = {
  async book(_, { id }, { dataSources }) {
    await callEndpoint();
    return dataSources.books.getBook(id);
  },
};
