import { MongoDataSource } from 'apollo-datasource-mongodb';
import { BaseBook } from '../lib/types';
import { BookDocument, BookModel } from '../models';

export class Books extends MongoDataSource<BookDocument> {
  /**
   * Gets a specific book by it's id
   * @param bookId 
   * @returns 
   */
  async getBook(bookId: string): Promise<BaseBook | null> {
    const book = await BookModel.findOne({ id: bookId });
    if (!book) {
      return null;
    }
    return {
      authorId: book.authorId, 
      id: book.id,
      name: book.name,
      publisherId: book.publisherId, 
      status: book.status
    };
  }

  /**
   * Creates a specific book
   * @param _book 
   * @returns 
   */
  async createBook(_book: BaseBook): Promise<BaseBook | null> {
    const book = await BookModel.create(_book);
    return { ...book };
  }
}
