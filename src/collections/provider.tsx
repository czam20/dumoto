import { buildCollection } from "firecms";

export const providerCollection = buildCollection({
  path: "providers",
  name: "Providers",
  singularName: "Provider",
  properties: {
    name: {
      name: "Name",
      validation: { required: true },
      dataType: "string",
    },
    location: {
      name: "location",
      description: "Is this locale selectable",
      validation: {
        min: 20,
      },

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
