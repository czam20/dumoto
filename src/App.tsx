import { useCallback } from "react";

import { User as FirebaseUser } from "firebase/auth";
import { Authenticator, FirebaseCMSApp } from "firecms";

import "typeface-rubik";
import "@fontsource/ibm-plex-mono";

import { app, firebaseConfig } from "./firebase-config.ts";
import { productsCollection } from "./collections/products.tsx";
import { addStockCollection } from "./collections/add_stock.tsx";
import { providerCollection } from "./collections/provider.tsx";
import { categoryCollection } from "./collections/categories.tsx";
import { usersCollection } from "./collections/users.tsx";

import { useFirestoreDataSource } from "firecms";
import { salesCollection } from "./collections/sales.tsx";
import { productSalesCollection } from "./collections/product_sale.tsx";

export type Product = {
  name: string;
  code: string;
  price: number;
  stock: number;
  description: string;
};

export default function App() {
  const dataSource = useFirestoreDataSource({
    firebaseApp: app,
  });

  const myAuthenticator: Authenticator<FirebaseUser> = useCallback(
    async ({ user, authController }) => {
      const dataUsers = await dataSource.fetchCollection({
        path: "users",
        collection: usersCollection,
      });

      const userData = await dataSource.saveEntity({
        status: dataUsers.some((u) => u.id === user?.email)
          ? "existing"
          : "new",
        collection: usersCollection,
        path: "users",
        entityId: user?.email as string,
        values: {
          name: user?.displayName,
          email: user?.email,
        },
      });

      const userRoles =
        dataUsers.find((u) => u.id === user?.email)?.values.roles || [];
      console.log("Allowing access to", userData.values, userRoles);
      authController.setExtra(userRoles);

      return true;
    },
    [dataSource]
  );

  return (
    <FirebaseCMSApp
      name={"Dumoto"}
      authentication={myAuthenticator}
      collections={[
        productsCollection,
        addStockCollection,
        providerCollection,
        categoryCollection,
        usersCollection,
        salesCollection,
        productSalesCollection,
      ]}
      firebaseConfig={firebaseConfig}
    />
  );
}
