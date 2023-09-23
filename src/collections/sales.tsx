import { buildCollection, buildProperty } from "firecms";
import { productSalesCollection } from "./product_sale";
import { productsCollection } from "./products";

export const salesCollection = buildCollection({
  path: "sales",
  name: "Sales",
  singularName: "sale",
  subcollections: [productSalesCollection],
  properties: {
    created_at: buildProperty({
      dataType: "date",
      name: "Created at",
      autoValue: "on_create",
    }),
    // productSale: buildProperty({
    //   name: "Products Sale",
    //   dataType: "array",
    //   of: {
    //     dataType: "reference",
    //     path: "product_sale",
    //   },
    // }),
    total_price: {
      name: "Total Price",
      readOnly: true,
      dataType: "number",
    },
  },
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
  callbacks: {
    onSaveSuccess: async (entitySaveProps) => {
      //   const {  } = entitySaveProps.values;

      console.log(entitySaveProps, "test");

      //   if (productSale) {
      //     let total_price = 0;
      //     for (let i = 0; i < productSale?.length; i++) {
      //       const ps = productSale[i];
      //       const productSaleData =
      //         await entitySaveProps.context.dataSource.fetchEntity({
      //           path: ps?.path as string,
      //           entityId: ps?.id as string,
      //           collection: productSalesCollection,
      //         });
      //       const product = productSaleData?.values.product as any;
      //       const quantity = productSaleData?.values.quantity as number;
      //       const productData =
      //         await entitySaveProps.context.dataSource.fetchEntity({
      //           path: product?.path as string,
      //           entityId: product?.id as string,
      //           collection: productsCollection,
      //         });
      //       total_price += quantity * (productData?.values.price ?? 0);
      //       await entitySaveProps.context.dataSource.saveEntity({
      //         status: "existing",
      //         values: {
      //           stock: productData?.values.stock
      //             ? productData?.values.stock - quantity
      //             : 0,
      //         },
      //         path: product?.path as string,
      //         entityId: product?.id as string,
      //         collection: productsCollection,
      //       });
      //       await entitySaveProps.context.dataSource.saveEntity({
      //         status: "existing",
      //         values: {
      //           total_price,
      //         },
      //         path: entitySaveProps?.path as string,
      //         entityId: entitySaveProps.entityId as string,
      //         collection: salesCollection,
      //       });
      //     }
      //   }
    },
  },
});
