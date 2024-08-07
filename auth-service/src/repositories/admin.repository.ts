import Admin, { AdminDocument } from "../models/admin.model";

import { IAdminRepository } from "../interfaces/admin.repository.interface";

class AdminRepository implements IAdminRepository {
  public async findUser(email: string): Promise<AdminDocument | null> {
    return await Admin.findOne({ email }).exec();
  }
}

export default AdminRepository;
