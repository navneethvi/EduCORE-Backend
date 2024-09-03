import { Model } from "mongoose"
import { AdminDocument } from "../models/admin.model";
import { IAdminRepository } from "../interfaces/admin.repository.interface";

class AdminRepository implements IAdminRepository {
  private readonly adminModel: Model<AdminDocument>;

  constructor(adminModel: Model<AdminDocument>) {
    this.adminModel = adminModel;
  }

  public async findUser(email: string): Promise<AdminDocument | null> {
    return await this.adminModel.findOne({ email }).exec();
  }
}

export default AdminRepository;
