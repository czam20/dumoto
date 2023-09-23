import {
  buildCollection,
  buildProperty,
  EntityOnFetchProps,
  ReferenceProperty,
} from "firecms";

export type Product = {
  name: string;
  code: string;
  price: number;
  stock: number;
  description: string;
  categories: ReferenceProperty[];
};

export const productsCollection = buildCollection<Product>({
  name: "Products",
  singularName: "Product",
  path: "products",
  icon: "LocalGroceryStore",
  permissions: ({ authController }) => {
    const isEmployee = authController.extra?.includes("employee");
    const isAdmin = authController.extra?.includes("admin");

    return {
      edit: isEmployee,
      create: isEmployee,
      delete: isAdmin,
      read: isEmployee,
    };
  },

  properties: {
    name: {
      name: "Name",
      validation: { required: true },
      dataType: "string",
    },
    code: {
      name: "Code",
      validation: { required: true },
      dataType: "string",
    },
    description: {
      name: "Description",
      validation: { required: true },
      dataType: "string",
    },
    price: {
      name: "Price",
      validation: {
        required: true,
        requiredMessage: "You must set a price greater than 0",
        min: 0,
      },
      dataType: "number",
    },
    stock: {
      name: "Stock",
      readOnly: true,
      dataType: "number",
    },
    categories: buildProperty({
      name: "Categories",
      dataType: "array",
      of: {
        dataType: "reference",
        path: "categories",
      },
    }),
  },
  callbacks: {
    onFetch: ({ entity }: EntityOnFetchProps) => {
      entity.values.stock = entity.values.stock ? entity.values.stock : 0;
      return entity;
    },
  },
});
