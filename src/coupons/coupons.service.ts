import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepository: Repository<Coupon>,
  ) {}

  create(createCouponDto: CreateCouponDto) {
    const coupon = this.couponRepository.create({
      ...createCouponDto,
      startAt: new Date(createCouponDto.startAt),
      endAt: new Date(createCouponDto.endAt),
    });
    return this.couponRepository.save(coupon);
  }

  findAll() {
    return this.couponRepository.find();
  }

  async findOne(id: number) {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }
    return coupon;
  }

  async update(id: number, updateCouponDto: UpdateCouponDto) {
    await this.findOne(id);
    await this.couponRepository.update(id, updateCouponDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const coupon = await this.findOne(id);
    return this.couponRepository.remove(coupon);
  }
}