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
      const responseData = coupons.map(coupon => {
        // Using 'any' to make the data transformation easier and avoid type errors.
        const plainCoupon: any = coupon;

        return {
          ...plainCoupon,
          // Using ?. to prevent errors if a date field is null or undefined.
          expirationDate: plainCoupon.expirationDate?.toISOString(),
        };
      });
      res.status(200).json(responseData);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  /**
   * Fetch a coupon by code
   */
  getCouponByCode = async (
    req: Request<{ code: string }>,
    res: Response,
  ): Promise<void> => {
    const { code } = req.params;
    try {
      const coupon = await this.couponService.getCouponByCode(code);
      if (!coupon) {
        res.status(404).json({ message: 'Coupon not found' });
        return;
      }

      const plainCoupon: any = coupon;
      const responseData = {
        ...plainCoupon,
        expirationDate: plainCoupon.expirationDate?.toISOString(),
      };
      res.status(200).json(responseData);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  /**
   * Create a new coupon
   */
  createCoupon = async (req: Request, res: Response): Promise<void> => {
    const { code, discountPercent, expirationDate, status, createdAt } = req.body;
    try {
      const newCoupon = await this.couponService.createCoupon({
        code,
        discountPercent,
        expirationDate: expirationDate ? new Date(expirationDate) : new Date(),
        status,
        createdAt: createdAt ? new Date(createdAt) : new Date(),
      });
      const plainCoupon: any = newCoupon;
      const responseData = {
        ...plainCoupon,
        expirationDate: plainCoupon.expirationDate?.toISOString(),
      };
      res.status(201).json(responseData);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  /**
   * Update a coupon's information by code
   */
  updateCoupon = async (
    req: Request<{ code: string }>,
    res: Response,
  ): Promise<void> => {
    const { code } = req.params;
    const updateData = req.body;
    try {
      const updatedCoupon = await this.couponService.updateCouponByCode(code, updateData);
      if (!updatedCoupon) {
        res.status(404).json({ message: 'Coupon not found' });
        return;
      }
      const plainCoupon: any = updatedCoupon;
      const responseData = {
        ...plainCoupon,
        expirationDate: plainCoupon.expirationDate?.toISOString(),
      };
      res.status(200).json(responseData);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
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
      const deletedCoupon = await this.couponService.deleteCouponByCode(code);
      if (!deletedCoupon) {
        res.status(404).json({ message: 'Coupon not found' });
        return;
      }
      res.status(200).json({ message: 'Coupon deleted successfully' });
    } catch (error) {
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