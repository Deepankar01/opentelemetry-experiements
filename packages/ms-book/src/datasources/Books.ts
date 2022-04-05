import { MongoDataSource } from 'apollo-datasource-mongodb'
import { BaseBook } from '../lib/types'
import { BookDocument } from '../models';

export class Books extends MongoDataSource<BookDocument> {
  async getBook(bookId: string): Promise<BaseBook | null> {
    const book = await this.findOneById(bookId)
    if(!book){
      return null;
    }
    return {
     ...book
    }
  }
}