import { buildCollection } from "firecms";

export const categoryCollection = buildCollection({
  path: "categories",
  name: "Categories",
  singularName: "Categorie",
  properties: {
    name: {
      name: "Name",
      validation: { required: true },
      dataType: "string",
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
});
