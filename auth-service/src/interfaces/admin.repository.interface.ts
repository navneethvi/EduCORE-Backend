import { AdminDocument } from "../models/admin.model";

export interface IAdminRepository {
  findUser(email: string): Promise<AdminDocument | null>;
}
