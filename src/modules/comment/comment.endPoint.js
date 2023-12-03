import { roles } from "../../middleware/auth.js";

export const endPoints = {
  userAndAdmin: [roles.USER, roles.ADMIN],
  adminOnly: [roles.ADMIN],
  userOnly: [roles.USER],
};
