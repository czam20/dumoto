import { buildCollection } from "firecms";

export const reportsCollection = buildCollection({
  path: "reports",
  name: "Reports",
  singularName: "reports",
  properties: {
    top3: {
      name: "Most Selled Products",
      dataType: "array",
      of: {
        dataType: "string",
      },
    },
    bottom3: {
      name: "Least Sold Products",
      dataType: "array",
      of: {
        dataType: "string",
      },
    },
  },
  permissions: () => {
    return {
      edit: false,
      create: false,
      delete: false,
      read: true,
    };
  },
});
