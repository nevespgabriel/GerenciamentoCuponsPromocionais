import path from 'path';
import { Server } from './domain/server/server';
import { BoilerplateController } from './application/controllers/boilerplate.controller';
import { BoilerplateService } from './domain/boilerplate/boilerplate.service';
import { CouponController } from './application/controllers/coupon.controller';
import { CouponService } from './domain/coupon/coupon.service';
import { CouponRepository } from './infraestructure/repository/coupon.repository';

const OPEN_API_SPEC_FILE_LOCATION = path.resolve(
  __dirname,
  './contracts/service.yaml',
);

const app = new Server({
  port: Number(process.env.PORT) || 3000,
  controllers: [
    new BoilerplateController(new BoilerplateService()),
    new CouponController(new CouponService(new CouponRepository())),
  ],
  databaseURI: process.env.DATABASE_URI,
  apiSpecLocation: OPEN_API_SPEC_FILE_LOCATION,
});

async function start() {
  app.databaseSetup();
  app.listen();
}

start();
