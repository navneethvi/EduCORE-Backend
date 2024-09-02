import bcryptjs from "bcryptjs";
import { AdminDocument } from "../models/admin.model";
import { generateAccessToken } from "../utils/jwt";
import { IAdminService } from "../interfaces/admin.service.interface";
import { IAdminRepository } from "../interfaces/admin.repository.interface";

class AdminService implements IAdminService {
  private adminRepository : IAdminRepository;

  constructor(adminRepository: IAdminRepository) {
    this.adminRepository = adminRepository;
  }

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
