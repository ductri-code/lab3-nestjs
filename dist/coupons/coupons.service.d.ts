import { Repository } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
export declare class CouponsService {
    private couponRepository;
    constructor(couponRepository: Repository<Coupon>);
    create(createCouponDto: CreateCouponDto): Promise<Coupon>;
    findAll(): Promise<Coupon[]>;
    findOne(id: number): Promise<Coupon>;
    update(id: number, updateCouponDto: UpdateCouponDto): Promise<Coupon>;
    remove(id: number): Promise<Coupon>;
}
