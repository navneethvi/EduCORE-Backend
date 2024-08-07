import { AdminDocument } from "../models/admin.model";

export interface IAdminService {
  signinAdmin(email: string, password: string): Promise<AdminDocument | null>;
}
