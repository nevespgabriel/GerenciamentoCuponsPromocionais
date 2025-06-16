import mongoose from "mongoose";
import { couponSchema } from "../schema/coupon.schema";

export const MCoupon = mongoose.model('coupon', couponSchema);