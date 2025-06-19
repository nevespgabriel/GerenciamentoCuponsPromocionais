import { CouponService } from '../../../domain/coupon/coupon.service'; 
import { CouponRepository } from '../../../infraestructure/repository/coupon.repository'; 
import { ICoupon } from '../../../domain/coupon/coupon.interface';

// Simulates the entire coupon.repository class
jest.mock('../../../infraestructure/repository/coupon.repository');

describe('CouponService - Unit Tests', () => {
  let couponService: CouponService;
  let mockCouponRepository: jest.Mocked<CouponRepository>;

  //Creating repository mock and passing it to an instance of CouponService before each teste
  beforeEach(() => {
    mockCouponRepository = new CouponRepository() as jest.Mocked<CouponRepository>;
    couponService = new CouponService(mockCouponRepository);
    jest.clearAllMocks(); // Clear previous mocks
  });

  describe('createCoupon', () => {
    it('should create a coupon and schedule validation when data is valid', async () => {
      const couponData: ICoupon = {
        code: 'SDOAF34',
        discountPercent: 10,
        expirationDate: new Date('2027-12-06T19:42:00Z'),
        status: 'pending',
      } as ICoupon;
      
      const createdCoupon = { ...couponData, createdAt: new Date() };

      // Simulates that does not exists any coupon with that code
      mockCouponRepository.findCouponByCode.mockResolvedValue(null);
      // Simulates well succeed creation on repository
      mockCouponRepository.createCoupon.mockResolvedValue(createdCoupon);
      
      // Spy the schedule validation method, assuring it will be called
      const scheduleValidationSpy = jest.spyOn(couponService as any, 'scheduleValidation');

      const result = await couponService.createCoupon(couponData);

      // Assert 
      expect(result).toEqual(createdCoupon);
      expect(mockCouponRepository.findCouponByCode).toHaveBeenCalledWith('SDOAF34');
      expect(mockCouponRepository.createCoupon).toHaveBeenCalledWith(couponData);
      expect(scheduleValidationSpy).toHaveBeenCalledWith(createdCoupon);
    });

    it('should throw an error if a coupon with the same code already exists', async () => {

      const couponData: ICoupon = { code: 'DKSAS1', discountPercent: 10, expirationDate: new Date('2027-12-06T19:42:00Z') } as ICoupon;

      mockCouponRepository.findCouponByCode.mockResolvedValue(couponData); //Found a coupon

      await expect(couponService.createCoupon(couponData)).rejects.toThrow('A coupon with this code already exists.'); //Verificates if the error with the message is thrown
    });

    it('should throw an error if the expiration date is in the past', async () => {

      const couponData: ICoupon = { code: 'DKSAS1', discountPercent: 10, expirationDate: new Date('2020-01-01T19:42:00Z') } as ICoupon;
      mockCouponRepository.findCouponByCode.mockResolvedValue(null);

      await expect(couponService.createCoupon(couponData)).rejects.toThrow('The expiration date must be a future date.');
    });
    
    it('should throw an error if the discount percent is out of range', async () => {

        const couponData: ICoupon = { code: 'DKSAS1', discountPercent: 101, expirationDate: new Date('2027-12-06T19:42:00Z') } as ICoupon;
        mockCouponRepository.findCouponByCode.mockResolvedValue(null);

        await expect(couponService.createCoupon(couponData)).rejects.toThrow('The discount percent must be a value between 1 and 100.');
    });
  });


  describe('getCouponByCode', () => {
    it('should return a coupon if found', async () => {

      const couponMock = { code: 'DKSAS1', discountPercent: 5, expirationDate: new Date('2027-12-06T19:42:00Z') } as ICoupon;
      mockCouponRepository.findCouponByCode.mockResolvedValue(couponMock);

      const result = await couponService.getCouponByCode('DKSAS1');

      expect(result).toEqual(couponMock);
      expect(mockCouponRepository.findCouponByCode).toHaveBeenCalledWith('DKSAS1');
    });

    it('should throw an error if coupon is not found', async () => {

      mockCouponRepository.findCouponByCode.mockResolvedValue(null);

      await expect(couponService.getCouponByCode('F')).rejects.toThrow('Coupon not found');
    });
  });
  
  // Specific tests for async validation method
  describe('scheduleValidation', () => {
    jest.useFakeTimers(); //jest time control
  
    it('should update status to "invalid" if discount is over 50', async () => {
      // Arrange
      const coupon: ICoupon = {
        code: 'DKSAS1',
        discountPercent: 51,
        expirationDate: new Date('2027-12-31'),
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockCouponRepository.findCouponByCode.mockResolvedValue(null);
      mockCouponRepository.createCoupon.mockResolvedValue(coupon);

      await couponService.createCoupon(coupon);
      await jest.runAllTimersAsync();
  
      // Assert
      expect(mockCouponRepository.updateCouponByCode).toHaveBeenCalledWith(
        'DKSAS1',
        { status: 'invalid' }
      ); //Verifies if the repository was called to update to invalid
    });
  
    it('should update status to "valid" if all conditions are met', async () => {
      // Arrange
      const coupon: ICoupon = {
        code: 'DKSAS1',
        discountPercent: 20,
        expirationDate: new Date('2027-12-31'),
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockCouponRepository.findCouponByCode.mockResolvedValue(null);
      mockCouponRepository.createCoupon.mockResolvedValue(coupon);
      
      await couponService.createCoupon(coupon);
      await jest.runAllTimersAsync();

      expect(mockCouponRepository.updateCouponByCode).toHaveBeenCalledWith(
        'DKSAS1',
        { status: 'valid' }
      );
    });
  });

  describe('listCoupons', () => {
    it('should return an array of coupons', async () => {

      const mockCoupons = [{ code: 'DKSAS1' }, { code: 'DKSAS2' }] as ICoupon[];
      mockCouponRepository.listCoupons.mockResolvedValue(mockCoupons);

      const result = await couponService.listCoupons();

      expect(result).toEqual(mockCoupons);
      expect(result.length).toBe(2);
      expect(mockCouponRepository.listCoupons).toHaveBeenCalled();
    });

    it('should return an empty array if no coupons exist', async () => {

      mockCouponRepository.listCoupons.mockResolvedValue([]);

      const result = await couponService.listCoupons();

      expect(result).toEqual([]);
    });
  });

  describe('updateCouponByCode', () => {
    it('should update the coupon successfully with valid data', async () => {

      const existingCoupon = { code: 'DKSAS1', discountPercent: 10 } as ICoupon;
      const updateData = { discountPercent: 20 };
      const updatedCoupon = { ...existingCoupon, ...updateData };

      mockCouponRepository.findCouponByCode.mockResolvedValue(existingCoupon);
      mockCouponRepository.updateCouponByCode.mockResolvedValue(updatedCoupon);

      const result = await couponService.updateCouponByCode('DKSAS1', updateData);

      // Assert
      expect(result).toEqual(updatedCoupon);
      expect(mockCouponRepository.updateCouponByCode).toHaveBeenCalledWith('DKSAS1', updateData);
    });

    it('should throw an error if the coupon to update is not found', async () => {

      mockCouponRepository.findCouponByCode.mockResolvedValue(null);

      await expect(couponService.updateCouponByCode('DKSAS1', { discountPercent: 50 })).rejects.toThrow('Coupon not found');
    });
    
    it('should throw an error for an out-of-range discount percent', async () => {

        const existingCoupon = { code: 'DKSAS1' } as ICoupon;
        mockCouponRepository.findCouponByCode.mockResolvedValue(existingCoupon);
        const updateData = { discountPercent: 101 };

        await expect(couponService.updateCouponByCode('DKSAS1', updateData)).rejects.toThrow('The discount percent must be a value between 1 and 100.');
    });

    it('should throw an error for an invalid status', async () => {

        const existingCoupon = { code: 'DKSAS1' } as ICoupon;
        mockCouponRepository.findCouponByCode.mockResolvedValue(existingCoupon);
        const updateData = { status: 'expired' as any }; // Cast to any to bypass TS type checking for the test

        await expect(couponService.updateCouponByCode('DKSAS1', updateData)).rejects.toThrow('The status must be "pending", "valid" or "invalid".');
    });
  });

  describe('deleteCouponByCode', () => {
    it('should delete a coupon successfully when it exists', async () => {

      const mockCoupon = { code: 'DKSAS1' } as ICoupon;
      mockCouponRepository.findCouponByCode.mockResolvedValue(mockCoupon);
      mockCouponRepository.deleteCouponByCode.mockResolvedValue(mockCoupon);

      const result = await couponService.deleteCouponByCode('DKSAS1');

      expect(result).toEqual(mockCoupon);
      expect(mockCouponRepository.deleteCouponByCode).toHaveBeenCalledWith('DKSAS1');
    });

    it('should throw a "Coupon not found" error when trying to delete a non-existent coupon', async () => {

      mockCouponRepository.findCouponByCode.mockResolvedValue(null);

      await expect(couponService.deleteCouponByCode('DKSAS1')).rejects.toThrow('Coupon not found');
    });
  });
});
