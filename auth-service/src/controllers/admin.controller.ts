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

      const newAdmin = await this.adminService.signinAdmin(email, password);

      if (!newAdmin) {
        return res
          .status(HttpStatusCodes.UNAUTHORIZED)
          .json({ message: "Invalid email or password." });
      }

      const { refreshToken, ...admin } = newAdmin;

      console.log("Setting refreshToken cookie:", refreshToken);

      res.cookie("adminRefreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      
      res
        .status(HttpStatusCodes.OK)
        .json({ message: "Signin successful", adminData: admin });
    } catch (error) {
      next(error);
    }
  };

  public logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      console.log("token from logout ===>", authHeader);
      console.log("cookieees ===>", req.cookies);

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
          .status(HttpStatusCodes.UNAUTHORIZED)
          .json({ message: "Authorization token is missing or invalid" });
      }

      const token = authHeader.split(" ")[1];

      console.log(token);

      res.clearCookie("adminRefreshToken");

      res.status(HttpStatusCodes.OK).json({ message: "Logout successful" });
    } catch (error) {
      next(error);
    }
  };
}

export default AdminController;
