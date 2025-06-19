import request from 'supertest';
import { Server } from '../../../domain/server/server';
import { Application } from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { CouponController } from '../../../application/controllers/coupon.controller';
import { CouponService } from '../../../domain/coupon/coupon.service';
import { CouponRepository } from '../../../infraestructure/repository/coupon.repository';
import { MCoupon } from '../../../infraestructure/db/mongo/models/coupon.model';

describe('Coupon Routes - Integration Tests', () => {
  let app: Application;
  let mongoServer: MongoMemoryServer;

  // Before all tests, set up the in-memory database and the full application.
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Instantiate the entire dependency chain
    const couponRepository = new CouponRepository();
    const couponService = new CouponService(couponRepository);
    const couponController = new CouponController(couponService);

    const server = new Server({
      port: 3001, // Use a different port for tests
      controllers: [couponController],
      databaseURI: mongoUri,
      apiPrefix: '/api',
    });

    await server.databaseSetup();
    app = server.app;
  });

  // After all tests, disconnect and stop the server.
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // Before each test, clear the coupon collection.
  beforeEach(async () => {
    await MCoupon.deleteMany({});
  });

  describe('POST /api/coupons', () => {
    it('should create a new coupon and return 201', async () => {
      const payload = {
        code: 'DSDKH1',
        discountPercent: 30,
        expirationDate: '2026-01-01T00:00:00Z',
      };

      const response = await request(app)
        .post('/api/coupons')
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.code).toBe(payload.code);
      expect(response.body.status).toBe('pending');
      // Check if the date was correctly transformed to string
      expect(typeof response.body.expirationDate).toBe('string');
    });

    it('should return 400 if the coupon code already exists', async () => {
        await request(app).post('/api/coupons').send({ code: 'DSDKH1', discountPercent: 10, expirationDate: '2099-01-01T00:00:00Z' });
        
        const response = await request(app)
          .post('/api/coupons')
          .send({ code: 'DSDKH1', discountPercent: 15, expirationDate: '2099-01-01T00:00:00Z' });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('A coupon with this code already exists.');
    });
  });

  describe('GET /api/coupons', () => {
    it('should return an array of coupons with status 200', async () => {
        // Arrange: Create some coupons first
        await MCoupon.create({ code: 'DSDKH1', discountPercent: 10, expirationDate: new Date() });
        await MCoupon.create({ code: 'DSDKH2', discountPercent: 20, expirationDate: new Date() });

        const response = await request(app).get('/api/coupons');

        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body.length).toBe(2);
        expect(response.body[0].code).toBe('DSDKH1');
        // Check if date transformation for lists is working
        expect(typeof response.body[0].expirationDate).toBe('string');
    });
  });
  
  describe('GET /api/coupons/:code', () => {
    it('should return a single coupon if code exists and status 200', async () => {
        
        await MCoupon.create({ code: 'DSDKH1', discountPercent: 10, expirationDate: new Date() });

        const response = await request(app).get('/api/coupons/DSDKH1');
    
        expect(response.status).toBe(200);
        expect(response.body.code).toBe('DSDKH1');
    });

    it('should return status 404 if coupon code does not exist', async () => {
        const response = await request(app).get('/api/coupons/DSDKH1');

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Coupon not found');
    });
  });

  describe('DELETE /api/coupons/:code', () => {
    it('should delete a coupon and return status 200 with a success message', async () => {

        await MCoupon.create({ code: 'DSDKH1', discountPercent: 10, expirationDate: new Date() });

        const response = await request(app).delete('/api/coupons/DSDKH1');
    
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Coupon deleted successfully');

        const findResponse = await request(app).get('/api/coupons/DSDKH1');
        expect(findResponse.status).toBe(404);
    });

    it('should return status 404 if trying to delete a non-existent coupon', async () => {

        const response = await request(app).delete('/api/coupons/DSDKH1');
        
        expect(response.status).toBe(404);
    });
  });
});