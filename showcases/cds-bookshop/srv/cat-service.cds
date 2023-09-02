using { bookshop } from '../db/schema';
service CatalogService @(path: '/bookshop') {

  /** For displaying lists of Books */
  @readonly entity ListOfBooks as projection on Books
  excluding { descr };

  /** For display in details pages */
 @readonly entity Books as projection on bookshop.Books
  { *, author.name as author }
  excluding { createdBy, modifiedBy };

  //@requires: 'authenticated-user'
  action submitOrder ( book: Books:ID, quantity: Integer ) returns { stock: Integer };
  event OrderedBook : { book: Books:ID; quantity: Integer; buyer: String };
}
