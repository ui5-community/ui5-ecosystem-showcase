/* checksum : 7e952320c6a7d0f1c704e82b3058161e */
@cds.external : true
@m.IsDefaultEntityContainer : 'true'
service Northwind {};

@cds.external : true
@cds.persistence.skip : true
entity Northwind.Categories {
  key CategoryID : Integer not null;
  CategoryName : String(15) not null;
  Description : LargeString;
  Picture : LargeBinary;
  @cds.ambiguous : 'missing on condition?'
  Products : Association to many Northwind.Products on Products.CategoryID = CategoryID;
};

@cds.external : true
@cds.persistence.skip : true
entity Northwind.CustomerDemographics {
  key CustomerTypeID : String(10) not null;
  CustomerDesc : LargeString;
  @cds.ambiguous : 'missing on condition?'
  Customers : Association to many Northwind.Customers {  };
};

@cds.external : true
@cds.persistence.skip : true
entity Northwind.Customers {
  key CustomerID : String(5) not null;
  CompanyName : String(40) not null;
  ContactName : String(30);
  ContactTitle : String(30);
  Address : String(60);
  City : String(15);
  Region : String(15);
  PostalCode : String(10);
  Country : String(15);
  Phone : String(24);
  Fax : String(24);
  @cds.ambiguous : 'missing on condition?'
  Orders : Association to many Northwind.Orders on Orders.CustomerID = CustomerID;
  @cds.ambiguous : 'missing on condition?'
  CustomerDemographics : Association to many Northwind.CustomerDemographics {  };
};

@cds.external : true
@cds.persistence.skip : true
entity Northwind.Employees {
  key EmployeeID : Integer not null;
  LastName : String(20) not null;
  FirstName : String(10) not null;
  Title : String(30);
  TitleOfCourtesy : String(25);
  @odata.Type : 'Edm.DateTime'
  BirthDate : DateTime;
  @odata.Type : 'Edm.DateTime'
  HireDate : DateTime;
  Address : String(60);
  City : String(15);
  Region : String(15);
  PostalCode : String(10);
  Country : String(15);
  HomePhone : String(24);
  Extension : String(4);
  Photo : LargeBinary;
  Notes : LargeString;
  ReportsTo : Integer;
  PhotoPath : String(255);
  @cds.ambiguous : 'missing on condition?'
  Employees1 : Association to many Northwind.Employees on Employees1.ReportsTo = EmployeeID;
  @cds.ambiguous : 'missing on condition?'
  Employee1 : Association to Northwind.Employees on Employee1.EmployeeID = ReportsTo;
  @cds.ambiguous : 'missing on condition?'
  Orders : Association to many Northwind.Orders on Orders.EmployeeID = EmployeeID;
  @cds.ambiguous : 'missing on condition?'
  Territories : Association to many Northwind.Territories {  };
};

@cds.external : true
@cds.persistence.skip : true
entity Northwind.Order_Details {
  key OrderID : Integer not null;
  key ProductID : Integer not null;
  UnitPrice : Decimal(19, 4) not null;
  Quantity : Integer not null;
  @odata.Type : 'Edm.Single'
  Discount : Double not null;
  @cds.ambiguous : 'missing on condition?'
  Order : Association to Northwind.Orders on Order.OrderID = OrderID;
  @cds.ambiguous : 'missing on condition?'
  Product : Association to Northwind.Products on Product.ProductID = ProductID;
};

@cds.external : true
@cds.persistence.skip : true
entity Northwind.Orders {
  key OrderID : Integer not null;
  CustomerID : String(5);
  EmployeeID : Integer;
  @odata.Type : 'Edm.DateTime'
  OrderDate : DateTime;
  @odata.Type : 'Edm.DateTime'
  RequiredDate : DateTime;
  @odata.Type : 'Edm.DateTime'
  ShippedDate : DateTime;
  ShipVia : Integer;
  Freight : Decimal(19, 4);
  ShipName : String(40);
  ShipAddress : String(60);
  ShipCity : String(15);
  ShipRegion : String(15);
  ShipPostalCode : String(10);
  ShipCountry : String(15);
  @cds.ambiguous : 'missing on condition?'
  Customer : Association to Northwind.Customers on Customer.CustomerID = CustomerID;
  @cds.ambiguous : 'missing on condition?'
  Employee : Association to Northwind.Employees on Employee.EmployeeID = EmployeeID;
  @cds.ambiguous : 'missing on condition?'
  Order_Details : Association to many Northwind.Order_Details on Order_Details.OrderID = OrderID;
  @cds.ambiguous : 'missing on condition?'
  Shipper : Association to Northwind.Shippers on Shipper.ShipperID = ShipVia;
};

@cds.external : true
@cds.persistence.skip : true
entity Northwind.Products {
  key ProductID : Integer not null;
  ProductName : String(40) not null;
  SupplierID : Integer;
  CategoryID : Integer;
  QuantityPerUnit : String(20);
  UnitPrice : Decimal(19, 4);
  UnitsInStock : Integer;
  UnitsOnOrder : Integer;
  ReorderLevel : Integer;
  Discontinued : Boolean not null;
  @cds.ambiguous : 'missing on condition?'
  Category : Association to Northwind.Categories on Category.CategoryID = CategoryID;
  @cds.ambiguous : 'missing on condition?'
  Order_Details : Association to many Northwind.Order_Details on Order_Details.ProductID = ProductID;
  @cds.ambiguous : 'missing on condition?'
  Supplier : Association to Northwind.Suppliers on Supplier.SupplierID = SupplierID;
};

@cds.external : true
@cds.persistence.skip : true
entity Northwind.Regions {
  key RegionID : Integer not null;
  RegionDescription : String(50) not null;
  @cds.ambiguous : 'missing on condition?'
  Territories : Association to many Northwind.Territories on Territories.RegionID = RegionID;
};

@cds.external : true
@cds.persistence.skip : true
entity Northwind.Shippers {
  key ShipperID : Integer not null;
  CompanyName : String(40) not null;
  Phone : String(24);
  @cds.ambiguous : 'missing on condition?'
  Orders : Association to many Northwind.Orders on Orders.ShipVia = ShipperID;
};

@cds.external : true
@cds.persistence.skip : true
entity Northwind.Suppliers {
  key SupplierID : Integer not null;
  CompanyName : String(40) not null;
  ContactName : String(30);
  ContactTitle : String(30);
  Address : String(60);
  City : String(15);
  Region : String(15);
  PostalCode : String(10);
  Country : String(15);
  Phone : String(24);
  Fax : String(24);
  HomePage : LargeString;
  @cds.ambiguous : 'missing on condition?'
  Products : Association to many Northwind.Products on Products.SupplierID = SupplierID;
};

@cds.external : true
@cds.persistence.skip : true
entity Northwind.Territories {
  key TerritoryID : String(20) not null;
  TerritoryDescription : String(50) not null;
  RegionID : Integer not null;
  @cds.ambiguous : 'missing on condition?'
  Region : Association to Northwind.Regions on Region.RegionID = RegionID;
  @cds.ambiguous : 'missing on condition?'
  Employees : Association to many Northwind.Employees {  };
};

@cds.external : true
@cds.persistence.skip : true
entity Northwind.Alphabetical_list_of_products {
  key ProductID : Integer not null;
  key ProductName : String(40) not null;
  key Discontinued : Boolean not null;
  key CategoryName : String(15) not null;
  SupplierID : Integer;
  CategoryID : Integer;
  QuantityPerUnit : String(20);
  UnitPrice : Decimal(19, 4);
  UnitsInStock : Integer;
  UnitsOnOrder : Integer;
  ReorderLevel : Integer;
};

@cds.external : true
@cds.persistence.skip : true
entity Northwind.Category_Sales_for_1997 {
  key CategoryName : String(15) not null;
  CategorySales : Decimal(19, 4);
};

@cds.external : true
@cds.persistence.skip : true
entity Northwind.Current_Product_Lists {
  key ProductID : Integer not null;
  key ProductName : String(40) not null;
};

@cds.external : true
@cds.persistence.skip : true
entity Northwind.Customer_and_Suppliers_by_Cities {
  key CompanyName : String(40) not null;
  key Relationship : String(9) not null;
  City : String(15);
  ContactName : String(30);
};

@cds.external : true
@cds.persistence.skip : true
entity Northwind.Invoices {
  key CustomerName : String(40) not null;
  key Salesperson : String(31) not null;
  key OrderID : Integer not null;
  key ShipperName : String(40) not null;
  key ProductID : Integer not null;
  key ProductName : String(40) not null;
  key UnitPrice : Decimal(19, 4) not null;
  key Quantity : Integer not null;
  @odata.Type : 'Edm.Single'
  key Discount : Double not null;
  ShipName : String(40);
  ShipAddress : String(60);
  ShipCity : String(15);
  ShipRegion : String(15);
  ShipPostalCode : String(10);
  ShipCountry : String(15);
  CustomerID : String(5);
  Address : String(60);
  City : String(15);
  Region : String(15);
  PostalCode : String(10);
  Country : String(15);
  @odata.Type : 'Edm.DateTime'
  OrderDate : DateTime;
  @odata.Type : 'Edm.DateTime'
  RequiredDate : DateTime;
  @odata.Type : 'Edm.DateTime'
  ShippedDate : DateTime;
  ExtendedPrice : Decimal(19, 4);
  Freight : Decimal(19, 4);
};

@cds.external : true
@cds.persistence.skip : true
entity Northwind.Order_Details_Extendeds {
  key OrderID : Integer not null;
  key ProductID : Integer not null;
  key ProductName : String(40) not null;
  key UnitPrice : Decimal(19, 4) not null;
  key Quantity : Integer not null;
  @odata.Type : 'Edm.Single'
  key Discount : Double not null;
  ExtendedPrice : Decimal(19, 4);
};

@cds.external : true
@cds.persistence.skip : true
entity Northwind.Order_Subtotals {
  key OrderID : Integer not null;
  Subtotal : Decimal(19, 4);
};

@cds.external : true
@cds.persistence.skip : true
entity Northwind.Orders_Qries {
  key OrderID : Integer not null;
  key CompanyName : String(40) not null;
  CustomerID : String(5);
  EmployeeID : Integer;
  @odata.Type : 'Edm.DateTime'
  OrderDate : DateTime;
  @odata.Type : 'Edm.DateTime'
  RequiredDate : DateTime;
  @odata.Type : 'Edm.DateTime'
  ShippedDate : DateTime;
  ShipVia : Integer;
  Freight : Decimal(19, 4);
  ShipName : String(40);
  ShipAddress : String(60);
  ShipCity : String(15);
  ShipRegion : String(15);
  ShipPostalCode : String(10);
  ShipCountry : String(15);
  Address : String(60);
  City : String(15);
  Region : String(15);
  PostalCode : String(10);
  Country : String(15);
};

@cds.external : true
@cds.persistence.skip : true
entity Northwind.Product_Sales_for_1997 {
  key CategoryName : String(15) not null;
  key ProductName : String(40) not null;
  ProductSales : Decimal(19, 4);
};

@cds.external : true
@cds.persistence.skip : true
entity Northwind.Products_Above_Average_Prices {
  key ProductName : String(40) not null;
  UnitPrice : Decimal(19, 4);
};

@cds.external : true
@cds.persistence.skip : true
entity Northwind.Products_by_Categories {
  key CategoryName : String(15) not null;
  key ProductName : String(40) not null;
  key Discontinued : Boolean not null;
  QuantityPerUnit : String(20);
  UnitsInStock : Integer;
};

@cds.external : true
@cds.persistence.skip : true
entity Northwind.Sales_by_Categories {
  key CategoryID : Integer not null;
  key CategoryName : String(15) not null;
  key ProductName : String(40) not null;
  ProductSales : Decimal(19, 4);
};

@cds.external : true
@cds.persistence.skip : true
entity Northwind.Sales_Totals_by_Amounts {
  key OrderID : Integer not null;
  key CompanyName : String(40) not null;
  SaleAmount : Decimal(19, 4);
  @odata.Type : 'Edm.DateTime'
  ShippedDate : DateTime;
};

@cds.external : true
@cds.persistence.skip : true
entity Northwind.Summary_of_Sales_by_Quarters {
  key OrderID : Integer not null;
  @odata.Type : 'Edm.DateTime'
  ShippedDate : DateTime;
  Subtotal : Decimal(19, 4);
};

@cds.external : true
@cds.persistence.skip : true
entity Northwind.Summary_of_Sales_by_Years {
  key OrderID : Integer not null;
  @odata.Type : 'Edm.DateTime'
  ShippedDate : DateTime;
  Subtotal : Decimal(19, 4);
};

