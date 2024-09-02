import { Request, Response, NextFunction } from "express";
import { HttpStatusCodes } from "@envy-core/common";
import { IAdminService } from "../interfaces/admin.service.interface";

class AdminController {
  private adminService: IAdminService;

  constructor(adminService: IAdminService) {
    this.adminService = adminService;
  }

  public signin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      console.log("Admin req body ===>", req.body);

      if (!email || !password) {
        return res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ message: "Email and password are required." });
      }

      const admin = await this.adminService.signinAdmin(email, password);

      console.log("Admin in controller: ", admin);

      res
        .status(HttpStatusCodes.OK)
        .json({ message: "Signin successful", adminData: admin });
    } catch (error) {
      next(error);
    }
  };
}

export default AdminController;
