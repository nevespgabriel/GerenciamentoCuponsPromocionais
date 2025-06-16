export interface ICoupon {
  code: string;
  discountPercent: number;
  expirationDate: Date;
  status: string;
  createdAt: Date;
}