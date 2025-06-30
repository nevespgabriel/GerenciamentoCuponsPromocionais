import { Router, Request, Response } from 'express';
import { IController } from '../../domain/server/interfaces/IController';
import { CouponService } from '../../domain/coupon/coupon.service';

export class CouponController implements IController {
  router: Router;
  private readonly couponService: CouponService;

  constructor(couponService: CouponService) {
    this.couponService = couponService;
    this.router = Router();
    this.initRoutes();
  }


  initRoutes() {
    this.router.get('/coupons', this.getCoupons);
    this.router.get('/coupons/:code', this.getCouponByCode);
    this.router.post('/coupons', this.createCoupon);
    this.router.put('/coupons/:code', this.updateCoupon);
    this.router.delete('/coupons/:code', this.deleteCoupon);
  }

  /**
   * Fetch all coupons
   */
  getCoupons = async (req: Request, res: Response): Promise<void> => {
    try {
      const coupons = await this.couponService.listCoupons();
      const responseData = coupons.map((coupon: any) => coupon._doc);
      res.status(200).json(responseData);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  /**
   * Fetch a coupon by code
   */
  getCouponByCode = async (req: Request, res: Response): Promise<void> => {
    const { code } = req.params;
    try {
      const coupon: any = await this.couponService.getCouponByCode(code);
      if (!coupon) {
        res.status(404).json({ message: 'Coupon not found' });
        return;
      }
      res.status(200).json(coupon._doc);
    } catch (error) {
      const err = error as Error;
      if (err.message.includes('not found')) {
        res.status(404).json({ message: err.message });
      } else {
        res.status(500).json({ error: err.message });
      }
    }
  };

  /**
   * Create a new coupon
   */
  createCoupon = async (req: Request, res: Response): Promise<void> => {
    const { code, discountPercent, expirationDate, status, createdAt, updatedAt } = req.body;
    try {
      const newCoupon = await this.couponService.createCoupon({
        code: code,
        discountPercent: discountPercent,
        expirationDate: expirationDate,
        status: status ? status : 'pending',
        createdAt: createdAt ? new Date(createdAt) : new Date(),
        updatedAt: updatedAt ? new Date(updatedAt) : new Date()
      });

      const plainCoupon: any = newCoupon;
      const responseData = {
        ...plainCoupon,
        expirationDate: plainCoupon.expirationDate?.toISOString(),
      };
      
      res.status(201).json(responseData._doc);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  /**
   * Update a coupon's information by code
   */
  updateCoupon = async (req: Request, res: Response): Promise<void> => {
    const { code } = req.params;
    try {
      const updatedCoupon: any = await this.couponService.updateCouponByCode(
        code,
        req.body,
      );
      if (!updatedCoupon) {
        res.status(404).json({ message: 'Coupon not found' });
        return;
      }
      res.status(200).json(updatedCoupon._doc);
    } catch (error) {
      const err = error as Error;
      if (err.message.includes('not found')) {
        res.status(404).json({ message: err.message });
      } else {
        res.status(400).json({ error: err.message });
      }
    }
  };

  /**
   * Delete a coupon by code
   */
  deleteCoupon = async (
    req: Request<{ code: string }>,
    res: Response,
  ): Promise<void> => {
    const { code } = req.params;
    try {
      console.log("PROCURANDO");
      const deletedCoupon = await this.couponService.deleteCouponByCode(code);
      console.log("NAO ACHOU");
      if (!deletedCoupon) {
        res.status(404).json({ message: 'Coupon not found' });
        return;
      }
      res.status(200).json({ message: 'Coupon deleted successfully' });
    } catch (error) {
      const err = error as Error;
      if (err.message.includes('not found')) {
        res.status(404).json({ message: err.message });
      } 
      res.status(500).json({ error: (error as Error).message });
    }
  };

  /**
   * Get the router with all routes
   */
  public getRoutes(): Router {
    return this.router;
  }
}