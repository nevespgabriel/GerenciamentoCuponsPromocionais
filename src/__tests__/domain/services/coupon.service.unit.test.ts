import { CouponService } from '../../../domain/coupon/coupon.service'; 
import { CouponRepository } from '../../../infraestructure/repository/coupon.repository'; 
import { ICoupon } from '../../../domain/coupon/coupon.interface';

// Simulates the entire coupon.repository class
jest.mock('../../../src/infraestructure/repository/coupon.repository');

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

      const coupon: ICoupon = { code: 'DKSAS1', discountPercent: 51, expirationDate: new Date('2027-12-06T19:42:00Z') } as ICoupon;
      const serviceInstance = new CouponService(mockCouponRepository);

      await serviceInstance.createCoupon(coupon);

      jest.advanceTimersByTime(3000); //3 seconds passes to activate the method

      await Promise.resolve();

      expect(mockCouponRepository.updateCouponByCode).toHaveBeenCalledWith('DKSAS1', { status: 'invalid' }); //Verificates if the repository was called to update to invalid
    });

    it('should update status to "valid" if all conditions are met', async () => {
        // Arrange
        const coupon: ICoupon = { code: 'DKSAS1', discountPercent: 20, expirationDate: new Date('2027-12-06T19:42:00Z')  } as ICoupon;
        const serviceInstance = new CouponService(mockCouponRepository);

        //Create coupon was mocked in the last test
        mockCouponRepository.findCouponByCode.mockResolvedValue(null);
        mockCouponRepository.createCoupon.mockResolvedValue(coupon);
        await serviceInstance.createCoupon(coupon);
        jest.advanceTimersByTime(3000);
        await Promise.resolve();

        expect(mockCouponRepository.updateCouponByCode).toHaveBeenCalledWith('DKSAS1', { status: 'valid' });
    });
  });
});