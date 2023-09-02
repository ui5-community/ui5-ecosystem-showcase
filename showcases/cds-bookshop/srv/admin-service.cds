using { bookshop } from '../db/schema';
service AdminService @(path: '/bookshop-admin') {
  entity Books as projection on bookshop.Books;
  entity Authors as projection on bookshop.Authors;
}
