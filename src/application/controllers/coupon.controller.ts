/*import { Router, Request, Response } from 'express';
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
    this.router.get('/coupons/:id', this.getCouponById);
    this.router.post('/coupons', this.createCoupon);
    this.router.put('/coupons/:id', this.updateCoupon);
    this.router.delete('/coupons/:id', this.deleteCoupon);
  }
}*/