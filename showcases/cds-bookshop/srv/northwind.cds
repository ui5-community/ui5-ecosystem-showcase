using { bookshop } from '../db/schema';
using { Northwind } from './external/Northwind';

service NorthwindService @(path: '/northwind') {
	entity Products as projection on Northwind.Products;
}
