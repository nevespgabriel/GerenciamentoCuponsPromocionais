import { CouponRepository } from '../../infraestructure/repository/coupon.repository';
import { ICoupon } from './coupon.interface';

export class CouponService {
  private couponRepository: CouponRepository;

  constructor(couponRepository: CouponRepository) {
    this.couponRepository = couponRepository;
  }
  /**
   * Create a new coupon
   * @param couponData - The coupon data to create
   * @returns The created coupon document
   */
  async createCoupon(couponData: ICoupon): Promise<ICoupon> {
    try {
      // Business logic (e.g., validation, ID/email uniqueness checks)
      const existingCoupon = await this.couponRepository.findCouponByCode(
        couponData.code,
      );
      if (existingCoupon) { 

        throw new Error('A coupon with this code already exists.');
      } else if(couponData.expirationDate <= new Date()){

        throw new Error('The expiration date must be a future date.');
      } else if(couponData.discountPercent < 1 || couponData.discountPercent > 100){

        throw new Error('The discount percent must be a value between 1 and 100.');
      } else if(couponData.status !== 'pending' && couponData.status !== 'valid' && couponData.status !== 'invalid'){

        throw new Error('The status must be "pending", "valid" or "invalid".');
      }

      return await this.couponRepository.createCoupon(couponData);
    } catch (error) {
      throw new Error(`Error creating coupon: ${(error as Error).message}`);
    }
  }

  /**
   * Get a coupon by code
   * @param code - The coupon's code
   * @returns The coupon document or null if not found
   */
  async getCouponByCode(code: string): Promise<ICoupon | null> {
    try {
      const coupon = await this.couponRepository.findCouponByCode(code);
      if (!coupon) {
        throw new Error('Coupon not found');
      }
      return coupon;
    } catch (error) {
      throw new Error(
        `Error retrieving coupon by code: ${(error as Error).message}`,
      );
    }
  }

  /**
   * List all coupons with optional filters
   * @param filter - Filters for the query
   * @returns An array of coupon documents
   */
  async listCoupons(filter: Partial<ICoupon> = {}): Promise<ICoupon[]> {
    try {
      return await this.couponRepository.listCoupons(filter);
    } catch (error) {
      throw new Error(`Error listing coupons: ${(error as Error).message}`);
    }
  }


  /**
   * Update a coupon's information by code
   * @param code - The coupon's code
   * @param updateData - The data to update
   * @returns The updated coupon document or null if not found
   */
  async updateCouponByCode(
    code: string,
    updateData: Partial<ICoupon>,
  ): Promise<ICoupon | null> {
    try {
      const coupon = await this.couponRepository.findCouponByCode(code);
      if (!coupon) {
        throw new Error('Coupon not found');
      } else if(updateData.expirationDate && updateData.expirationDate <= new Date()){

        throw new Error('The expiration date must be a future date.');
      } else if(updateData.discountPercent && (updateData.discountPercent < 1 || updateData.discountPercent > 100)){

        throw new Error('The discount percent must be a value between 1 and 100.');
      } else if(updateData.status && updateData.status !== 'pending' && updateData.status !== 'valid' && updateData.status !== 'invalid'){

        throw new Error('The status must be "pending", "valid" or "invalid".');
      }

      return await this.couponRepository.updateCouponByCode(code, updateData);
    } catch (error) {
      throw new Error(`Error updating coupon: ${(error as Error).message}`);
    }
  }

  /**
   * Delete a coupon by ID
   * @param id - The coupon's ID
   * @returns The deleted coupon document or null if not found
   */
  async deleteCouponByCode(code: string): Promise<ICoupon | null> {
    try {
      const coupon = await this.couponRepository.findCouponByCode(code);
      if (!coupon) {
        throw new Error('Coupon not found');
      }

      return await this.couponRepository.deleteCouponByCode(code);
    } catch (error) {
      throw new Error(`Error deleting coupon: ${(error as Error).message}`);
    }
  }

}
