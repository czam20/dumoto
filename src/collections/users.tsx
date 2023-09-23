import { buildCollection, buildEnumValues } from "firecms";

const locales = buildEnumValues({
  "en-US": "English (United States)",
  "es-ES": "Spanish (Spain)",
  "de-DE": "German",
});

export const usersCollection = buildCollection({
  path: "users",
  customId: true,
  name: "Employee",
  singularName: "User",
  properties: {
    email: {
      name: "email",
      dataType: "string",
    },
    name: {
      name: "name",
      dataType: "string",
    },
    roles: {
      name: "roles",
      dataType: "array",
      of: {
        dataType: "string",
      },
    },
  },
  permissions: ({ authController }) => {
    const isAdmin = authController.extra?.includes("admin");

    return {
      edit: isAdmin,
      create: isAdmin,
      delete: isAdmin,
      read: isAdmin,
    };
  },
});
