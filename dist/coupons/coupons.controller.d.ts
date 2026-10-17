import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
export declare class CouponsController {
    private readonly couponsService;
    constructor(couponsService: CouponsService);
    create(createCouponDto: CreateCouponDto): Promise<import("./entities/coupon.entity").Coupon>;
    findAll(): Promise<import("./entities/coupon.entity").Coupon[]>;
    findOne(id: string): Promise<import("./entities/coupon.entity").Coupon>;
    update(id: string, updateCouponDto: UpdateCouponDto): Promise<import("./entities/coupon.entity").Coupon>;
    remove(id: string): Promise<import("./entities/coupon.entity").Coupon>;
}
