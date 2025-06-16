export class Coupon {
  code: string;
  discountPercent: number;
  expirationDate: Date;
  status: string;
  createdAt: Date;
  constructor(code: string, discountPercent: number, expirationDate: Date, status: string, createdAt: Date) {
    this.code = code;
    this.discountPercent = discountPercent;
    this.expirationDate = expirationDate;
    this.status = status;
    this.createdAt = createdAt;
  }
}