import { Request, Response, NextFunction } from "express";

class PaymentController {
  public createPayment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log("createPayment=========>", req.body);
    } catch (error) {
      next(error);
    }
  };
}

export default PaymentController;
