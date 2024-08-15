import bcryptjs from "bcryptjs";
import AdminRepository from "../repositories/admin.repository";
import { AdminDocument } from "../models/admin.model";
import { generateAccessToken } from "../utils/jwt";

import { IAdminService } from "../interfaces/admin.service.interface";

class AdminService implements IAdminService {
  private adminRepository = new AdminRepository();

  public async signinAdmin(
    email: string,
    password: string
  ): Promise<AdminDocument | null> {
    const admin = await this.adminRepository.findUser(email);

    if (!admin) {
      throw new Error("Invalid email or password.");
    }

    const isPasswordMatch = await bcryptjs.compare(password, admin.password);

    if (!isPasswordMatch) {
      throw new Error("Invalid password.");
    }

    const token = generateAccessToken({
      id: admin._id,
      email: admin.email,
      role: "admin",
    });

    const adminWithToken = { ...admin.toObject(), token };

    return adminWithToken;
  }
}

export default AdminService;
