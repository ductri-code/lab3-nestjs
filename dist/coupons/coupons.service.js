"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const coupon_entity_1 = require("./entities/coupon.entity");
let CouponsService = class CouponsService {
    couponRepository;
    constructor(couponRepository) {
        this.couponRepository = couponRepository;
    }
    create(createCouponDto) {
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
    async findOne(id) {
        const coupon = await this.couponRepository.findOne({ where: { id } });
        if (!coupon) {
            throw new common_1.NotFoundException(`Coupon with ID ${id} not found`);
        }
        return coupon;
    }
    async update(id, updateCouponDto) {
        await this.findOne(id);
        await this.couponRepository.update(id, updateCouponDto);
        return this.findOne(id);
    }
    async remove(id) {
        const coupon = await this.findOne(id);
        return this.couponRepository.remove(coupon);
    }
};
exports.CouponsService = CouponsService;
exports.CouponsService = CouponsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(coupon_entity_1.Coupon)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CouponsService);
//# sourceMappingURL=coupons.service.js.map