import mongoose from "mongoose";
import { couponSchema } from "../schema/coupon.schema";

export const Mcoupon = mongoose.model('coupon', couponSchema);