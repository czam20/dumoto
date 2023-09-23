import { buildCollection } from "firecms";
import { productsCollection } from "./products";
import { salesCollection } from "./sales";

export const productSalesCollection = buildCollection({
  path: "product_sale",
  name: "Product Sale",
  singularName: "Product Sale",

  properties: {
    product: {
      name: "Product",
      dataType: "reference",
      path: "products",
      previewProperties: ["name", "price", "stock"],
    },
    quantity: {
      name: "Quantity",
      dataType: "number",
    },
  },
  permissions: ({ authController }) => {
    const isEmployee = authController.extra?.includes("employee");
    const isAdmin = authController.extra?.includes("admin");

    return {
      edit: false,
      create: isEmployee,
      delete: false,
      read: isEmployee,
    };
  },
  callbacks: {
    onPreSave: async (entitySaveProps) => {
      const product = entitySaveProps.values.product as any;
      const quantity = entitySaveProps.values.quantity as number;

      const productData = await entitySaveProps.context.dataSource.fetchEntity({
        path: product?.path as string,
        entityId: product?.id as string,
        collection: productsCollection,
      });

      if ((productData?.values.stock ?? 0) - quantity < 0) {
        throw new Error(
          " There is not enough stock :" + productData?.values.stock ?? 0
        );
      }

      const salesId = (entitySaveProps.path as string).split("/")[1];

      console.log(salesId, "test");
      const saleData = await entitySaveProps.context.dataSource.fetchEntity({
        path: "sales",
        entityId: salesId,
        collection: salesCollection,
      });

      const price = productData?.values.price as number;
      const totalPrice = (saleData?.values.total_price || 0) as number;

      console.log(price, totalPrice, "test");

      await entitySaveProps.context.dataSource.saveEntity({
        status: "existing",
        values: {
          total_price: totalPrice + quantity * price,
        },
        path: "sales",
        entityId: salesId,
        collection: salesCollection,
      });

      await entitySaveProps.context.dataSource.saveEntity({
        status: "existing",
        values: {
          stock: productData?.values.stock
            ? productData?.values.stock - quantity
            : 0,
        },
        path: product?.path as string,
        entityId: product?.id as string,
        collection: productsCollection,
      });

      return entitySaveProps.values;
    },
  },
});
