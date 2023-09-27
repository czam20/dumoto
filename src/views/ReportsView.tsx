import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import {
  EntityCollectionView,
  useAuthController,
  useSelectionController,
} from "firecms";
import { reportsCollection } from "../collections/reports";
import dayjs, { Dayjs } from "dayjs";
import { app } from "../firebase-config";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
} from "firebase/firestore";

export function ReportsView() {
  // hook to display custom snackbars
  const [from, setFrom] = useState<Dayjs | null>(null);
  const [to, setTo] = useState<Dayjs | null>(null);

  const selectionController = useSelectionController();

  // hook to do operations related to authentication
  const authController = useAuthController();

  const generateReport = async () => {
    const auxFrom = new Date(from?.toString() as string);
    const auxTo = new Date(to?.toString() as string);

    const db = getFirestore(app);

    const salesRef = collection(db, `sales`);

    const q1 = query(salesRef);

    const querySnapshot = await getDocs(q1);

    const data: any = [];
    const queryProductSalesPromises: any = [];

    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots

      const productSaleRef = collection(db, `sales/${doc.id}/product_sale`);
      const q = query(productSaleRef);

      queryProductSalesPromises.push(getDocs(q));

      data.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    let productsSales: any = await Promise.all(queryProductSalesPromises);
    productsSales = productsSales.map((qs: any) => {
      const productsSale: any = [];

      qs.forEach((doc: any) => {
        // doc.data() is never undefined for query doc snapshots
        // const product = await getDoc(doc.data().product);

        const values = {
          id: doc.id,
          data: doc.data(),
        };

        productsSale.push(values);
      });

      return productsSale;
    });

    for (let i = 0; i < data.length; i++) {
      data[i] = {
        ...data[i],
        productsSale: productsSales[i],
      };
    }

    const result = getTopAndBottomProducts(data, from, to);

    for (let i = 0; i < result.bottom3.length; i++) {
      const docRef = doc(db, "products" + "/" + result.bottom3[i][0]);
      const docSnap = await getDoc(docRef);
      const data: any = docSnap.data();

      result.bottom3[i][0] = data?.name ?? "deleted product";
    }

    for (let i = 0; i < result.top3.length; i++) {
      const docRef = doc(db, "products" + "/" + result.top3[i][0]);
      const docSnap = await getDoc(docRef);
      const data: any = docSnap.data();
      result.top3[i][0] = data?.name ?? "deleted product";
    }

    await addDoc(collection(db, "reports"), {
      top3: result.top3.map((n) => n[0]),
      bottom3: result.bottom3.map((n) => n[0]),
    });
  };

  function getTopAndBottomProducts(
    salesArray: any,
    startDate: any,
    endDate: any
  ) {
    // Convertir las fechas string en objetos Date
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Filtrar las ventas por rango de fecha
    const filteredSales = salesArray.filter((sale: any) => {
      const saleDate = sale.created_at.toDate();
      return saleDate >= start && saleDate <= end;
    });

    // Crear un objeto para mantener la suma de las cantidades vendidas de cada producto
    const productSums: any = {};

    filteredSales.forEach((sale: any) => {
      sale.productsSale.forEach((product: any) => {
        const segments = product.data.product._key.path.segments;

        const prodId = segments[segments.length - 1];

        if (productSums[prodId]) {
          productSums[prodId] += product.data.quantity;
        } else {
          productSums[prodId] = product.data.quantity;
        }
      });
    });

    // Convertir el objeto en un array y ordenarlo por cantidad vendida
    const sortedProducts = Object.entries(productSums).sort(
      (a: any, b: any) => b[1] - a[1]
    );

    // Obtener los tres productos más vendidos y los tres menos vendidos
    const top3 = sortedProducts.slice(0, 3);
    const bottom3 = sortedProducts.slice(-3).reverse();

    return {
      top3,
      bottom3,
    };
  }

  return (
    <Box display="flex" width={"100%"} height={"100%"}>
      <Box
        width={"100%"}
        height={"100%"}
        m="auto"
        display="flex"
        flexDirection={"column"}
        alignItems={"center"}
        justifyItems={"center"}
      >
        <Container
          sx={{
            my: 4,
          }}
        >
          <Grid container rowSpacing={5} columnSpacing={2}>
            <Grid item xs={12}>
              <Typography variant={"h4"}>Reports</Typography>
              <Typography>
                {authController.user ? (
                  <>Logged in as {authController.user.displayName}</>
                ) : (
                  <>You are not logged in</>
                )}
              </Typography>
              <div style={{ marginTop: 5, display: "flex", gap: 10 }}>
                <DatePicker
                  label="From"
                  renderInput={(props) => <TextField {...props} />}
                  value={from}
                  onChange={(newValue) => setFrom(newValue)}
                />
                <DatePicker
                  label="To"
                  renderInput={(props) => <TextField {...props} />}
                  value={to}
                  onChange={(newValue) => setTo(newValue)}
                />
                <Button
                  variant="outlined"
                  onClick={() => generateReport()}
                  disabled={!from || !to}
                >
                  Generate Report
                </Button>
              </div>
            </Grid>
          </Grid>
          <Paper
            variant={"outlined"}
            sx={{
              // width: 800,
              height: 400,
              overflow: "hidden",
              my: 2,
            }}
          >
            <EntityCollectionView
              {...reportsCollection}
              fullPath={"reports"}
              selectionController={selectionController}
            />
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}
