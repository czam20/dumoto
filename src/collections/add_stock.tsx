import { buildCollection, buildProperty } from "firecms";
import { productsCollection } from "./products";

export const addStockCollection = buildCollection({
  name: "Add Stock",
  singularName: "Stock",
  path: "add_stock",
  icon: "LocalGroceryStore",
  permissions: ({ authController }) => {
    const isEmployee = authController.extra?.includes("employee");
    const isAdmin = authController.extra?.includes("admin");

    return {
      edit: false,
      create: isEmployee,
      delete: isAdmin,
      read: isEmployee,
    };
  },

  properties: {
    quantity: buildProperty({
      dataType: "number",
      name: "Quantity",
      validation: {
        required: true,
      },
    }),
    product: buildProperty({
      dataType: "reference",
      name: "Product",
      path: "products",
      validation: {
        required: true,
      },
    }),
    provider: buildProperty({
      dataType: "reference",
      name: "Provider",
      path: "providers",
      validation: {
        required: true,
      },
    }),
    added_at: buildProperty({
      dataType: "date",
      name: "Added at",
      autoValue: "on_create",
    }),
  },
  callbacks: {
    onSaveSuccess: async (entitySaveProps) => {
      const { product } = entitySaveProps.values;

      const quantity = entitySaveProps.values.quantity as number;

      const productData = await entitySaveProps.context.dataSource.fetchEntity({
        path: product?.path as string,
        entityId: product?.id as string,
        collection: productsCollection,
      });

      entitySaveProps.context.dataSource.saveEntity({
        status: "existing",
        values: {
          stock: productData?.values.stock
            ? productData?.values.stock + quantity
            : entitySaveProps.values.quantity,
        },
        path: product?.path as string,
        entityId: product?.id as string,
        collection: productsCollection,
      });
    },
  },
});
