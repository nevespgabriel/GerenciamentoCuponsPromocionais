import { CouponRepository } from '../../../infraestructure/repository/coupon.repository';
import { MCoupon } from '../../../infraestructure/db/mongo/models/coupon.model';
import { ICoupon } from '../../../domain/coupon/coupon.interface';

describe('CouponRepository - Integration Tests', () => {
  let couponRepository: CouponRepository;

  beforeAll(async () => {
    couponRepository = new CouponRepository();
    await MCoupon.createIndexes();
  });

  beforeEach(async () => {
    await MCoupon.deleteMany({});
  });

  describe('createCoupon', () => {
    it('should create and save a new coupon successfully', async () => {

      const couponData = {
        code: 'DFSAS31',
        discountPercent: 25,
        expirationDate: new Date('2099-12-31'),
        status: 'pending',
      } as ICoupon;

      const savedCoupon = await couponRepository.createCoupon(couponData);

      expect(savedCoupon).toBeDefined();
      expect(savedCoupon.code).toBe(couponData.code);
      expect(savedCoupon.status).toBe('pending');

      const foundInDb = await MCoupon.findOne({ code: savedCoupon.code });
      expect(foundInDb).not.toBeNull();
    });

    it('should throw a duplicate key error if coupon code already exists', async () => {

      const couponData = { code: 'DFSAS31', discountPercent: 10, expirationDate: new Date() } as ICoupon;
      await couponRepository.createCoupon(couponData);

      await expect(couponRepository.createCoupon(couponData)).rejects.toThrow(/E11000 duplicate key error/);
    });
  });

  describe('listCoupons', () => {
    it('should return an empty array when no coupons exist', async () => {

      const coupons = await couponRepository.listCoupons();

      expect(coupons).toBeInstanceOf(Array);
      expect(coupons.length).toBe(0);
    });

    it('should return all existing coupons', async () => {

      await couponRepository.createCoupon({ code: 'DFSAS31', discountPercent: 10, expirationDate: new Date() } as ICoupon);
      await couponRepository.createCoupon({ code: 'DFSAS32', discountPercent: 20, expirationDate: new Date() } as ICoupon);

      const coupons = await couponRepository.listCoupons();

      expect(coupons.length).toBe(2);
      expect(coupons.map(c => c.code)).toContain('DFSAS31');
      expect(coupons.map(c => c.code)).toContain('DFSAS32');
    });
  });

  describe('findCouponByCode', () => {
    it('should find and return a coupon by its code', async () => {

      const couponData = { code: 'DFSAS31', discountPercent: 50, expirationDate: new Date() } as ICoupon;
      await couponRepository.createCoupon(couponData);

      const foundCoupon = await couponRepository.findCouponByCode('DFSAS31');

      expect(foundCoupon).not.toBeNull();
      expect(foundCoupon?.code).toBe('DFSAS31');
    });

    it('should return null if no coupon is found with the given code', async () => {

      const foundCoupon = await couponRepository.findCouponByCode('DFSAS31');

      expect(foundCoupon).toBeNull();
    });
  });
  
  describe('updateCouponByCode', () => {
    it('should find a coupon by code and update its data', async () => {

        const initialCoupon = await couponRepository.createCoupon({ code: 'DFSAS31', discountPercent: 20, expirationDate: new Date() } as ICoupon);
        const updateData = { discountPercent: 25, status: 'valid' };

        const updatedCoupon = await couponRepository.updateCouponByCode('DFSAS31', updateData);

        expect(updatedCoupon).not.toBeNull();
        expect(updatedCoupon?.discountPercent).toBe(25);
        expect(updatedCoupon?.status).toBe('valid');
    });

    it('should return null when trying to update a non-existent coupon', async () => {

        const result = await couponRepository.updateCouponByCode('DFSAS31', { discountPercent: 10 });

        expect(result).toBeNull();
    });
  });

  describe('deleteCouponByCode', () => {
    it('should find a coupon by code and delete it', async () => {

        const couponData = { code: 'DFSAS31', discountPercent: 20, expirationDate: new Date() } as ICoupon;
        await couponRepository.createCoupon(couponData);

        const deletedCoupon = await couponRepository.deleteCouponByCode('DFSAS31');
        const shouldBeNull = await couponRepository.findCouponByCode('DFSAS31');

        expect(deletedCoupon).not.toBeNull();
        expect(deletedCoupon?.code).toBe('DFSAS31');
        expect(shouldBeNull).toBeNull();
    });

    it('should return null when trying to delete a non-existent coupon', async () => {
        // Act
        const result = await couponRepository.deleteCouponByCode('DFSAS31');

        expect(result).toBeNull();
    });
  });
});