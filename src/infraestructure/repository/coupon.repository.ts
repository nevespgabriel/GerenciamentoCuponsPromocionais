import { ICoupon } from '../../domain/coupon/coupon.interface';
import { MCoupon } from '../db/mongo/models/coupon.model';

export class CouponRepository {
  /**
   * Create a new coupon in the database
   * @param CouponData - The coupon data to create
   * @returns The created coupon document
   */
  async createCoupon(CouponData: ICoupon): Promise<ICoupon> {
    try {
      const coupon = new MCoupon(CouponData);
      return await coupon.save();
    } catch (error) {
      throw new Error(`Error creating coupon: ${(error as Error).message}`);
    }
  }

  /**
   * List all coupons
   * @param filter - Optional filters for the query
   * @returns An array of coupon documents
   */
  async listCoupons(filter: Partial<ICoupon> = {}): Promise<ICoupon[]> {
    try {
      return await MCoupon.find(filter);
    } catch (error) {
      throw new Error(`Error listing coupons: ${(error as Error).message}`);
    }
  }


  /**
   * Find a coupon by code
   * @param code - The coupon's code
   * @returns The coupon document or null if not found
   */
  async findCouponByCode(code: string): Promise<ICoupon | null> {
    try {
      return await MCoupon.findOne({ code });
    } catch (error) {
      throw new Error(`Error finding coupon by code: ${(error as Error).message}`);
    }
  }

  /**
   * Update a coupon by code
   * @param code - The coupon's code
   * @param updateData - The data to update
   * @returns The updated coupon document or null if not found
   */
  async updateCouponByCode(
    code: string,
    updateData: Partial<ICoupon>,
  ): Promise<ICoupon | null> {
    try {
      return await MCoupon.findOneAndUpdate({ code }, updateData, {
        new: true, //Returns the updated document
      });
    } catch (error) {
      throw new Error(`Error updating coupon by code: ${(error as Error).message}`);
    }
  }

  /**
   * Delete a Coupon by code
   * @param code - The Coupon's code
   * @returns The deleted Coupon document or null if not found
   */
  async deleteCouponByCode(code: string): Promise<ICoupon | null> {
    try {
      return await MCoupon.findOneAndDelete({ code });
    } catch (error) {
      throw new Error(`Error deleting Coupon by code: ${(error as Error).message}`);
    }
  }
}
