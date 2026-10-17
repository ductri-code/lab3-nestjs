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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("./entities/order.entity");
const order_item_entity_1 = require("./entities/order-item.entity");
const order_status_history_entity_1 = require("./entities/order-status-history.entity");
const idempotency_key_entity_1 = require("./entities/idempotency-key.entity");
const product_entity_1 = require("../products/entities/product.entity");
const coupon_entity_1 = require("../coupons/entities/coupon.entity");
const payment_entity_1 = require("../payments/entities/payment.entity");
let OrdersService = class OrdersService {
    dataSource;
    orderRepo;
    idempotencyRepo;
    historyRepo;
    constructor(dataSource, orderRepo, idempotencyRepo, historyRepo) {
        this.dataSource = dataSource;
        this.orderRepo = orderRepo;
        this.idempotencyRepo = idempotencyRepo;
        this.historyRepo = historyRepo;
    }
    async createOrder(createOrderDto, idempotencyKey) {
        if (idempotencyKey) {
            const existingKey = await this.idempotencyRepo.findOne({ where: { key: idempotencyKey } });
            if (existingKey) {
                return this.orderRepo.findOne({
                    where: { id: existingKey.orderId },
                    relations: { items: { product: true } },
                });
            }
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            let subtotal = 0;
            const orderItemsToSave = [];
            for (const itemDto of createOrderDto.items) {
                const product = await queryRunner.manager.findOne(product_entity_1.Product, { where: { id: itemDto.productId } });
                if (!product) {
                    throw new common_1.NotFoundException(`Product with ID ${itemDto.productId} not found`);
                }
                if (product.quantity < itemDto.quantity) {
                    throw new common_1.BadRequestException(`Product '${product.name}' is out of stock (remaining: ${product.quantity})`);
                }
                product.quantity -= itemDto.quantity;
                await queryRunner.manager.save(product);
                const unitPrice = Number(product.price);
                subtotal += unitPrice * itemDto.quantity;
                const orderItem = new order_item_entity_1.OrderItem();
                orderItem.product = product;
                orderItem.quantity = itemDto.quantity;
                orderItem.unitPrice = unitPrice;
                orderItemsToSave.push(orderItem);
            }
            let discountAmount = 0;
            let appliedCouponCode = null;
            if (createOrderDto.couponCode) {
                const coupon = await queryRunner.manager.findOne(coupon_entity_1.Coupon, { where: { code: createOrderDto.couponCode } });
                if (!coupon) {
                    throw new common_1.BadRequestException(`Coupon '${createOrderDto.couponCode}' does not exist`);
                }
                const now = new Date();
                if (!coupon.isActive || now < new Date(coupon.startAt) || now > new Date(coupon.endAt)) {
                    throw new common_1.BadRequestException(`Coupon '${coupon.code}' is expired or inactive`);
                }
                if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
                    throw new common_1.BadRequestException(`Coupon '${coupon.code}' has reached its usage limit`);
                }
                if (subtotal < Number(coupon.minOrderValue)) {
                    throw new common_1.BadRequestException(`Order subtotal must be at least ${coupon.minOrderValue} to use this coupon`);
                }
                if (coupon.categoryId !== null && coupon.categoryId !== undefined) {
                    for (const itemDto of createOrderDto.items) {
                        const prod = await queryRunner.manager.findOne(product_entity_1.Product, { where: { id: itemDto.productId } });
                        if (prod && Number(prod.categoryId) !== Number(coupon.categoryId)) {
                            throw new common_1.BadRequestException(`Coupon '${coupon.code}' is not applicable for this product category`);
                        }
                    }
                }
                if (createOrderDto.customerPhone) {
                    const usedCountForPhone = await queryRunner.manager.count(order_entity_1.Order, {
                        where: {
                            customerPhone: createOrderDto.customerPhone,
                            couponCode: coupon.code,
                        },
                    });
                    if (usedCountForPhone > 0) {
                        throw new common_1.BadRequestException(`Customer with phone '${createOrderDto.customerPhone}' has already used this coupon`);
                    }
                }
                let discount = 0;
                if (coupon.discountType === coupon_entity_1.DiscountType.PERCENT) {
                    discount = (subtotal * Number(coupon.discountValue)) / 100;
                }
                else {
                    discount = Number(coupon.discountValue);
                }
                discountAmount = Math.min(discount, subtotal);
                coupon.usedCount += 1;
                await queryRunner.manager.save(coupon);
                appliedCouponCode = coupon.code;
            }
            let shippingFee = 0;
            if (subtotal < 500000) {
                shippingFee = 30000;
            }
            else if (subtotal < 1000000) {
                shippingFee = 15000;
            }
            else {
                shippingFee = 0;
            }
            const grandTotal = subtotal - discountAmount + shippingFee;
            const order = new order_entity_1.Order();
            order.customerName = createOrderDto.customerName;
            order.customerPhone = createOrderDto.customerPhone;
            order.shippingAddress = createOrderDto.shippingAddress;
            order.couponCode = appliedCouponCode;
            order.status = order_entity_1.OrderStatus.PENDING;
            order.subtotal = subtotal;
            order.discountAmount = discountAmount;
            order.shippingFee = shippingFee;
            order.grandTotal = grandTotal;
            order.items = orderItemsToSave;
            const savedOrder = await queryRunner.manager.save(order);
            const history = new order_status_history_entity_1.OrderStatusHistory();
            history.orderId = savedOrder.id;
            history.fromStatus = 'NONE';
            history.toStatus = order_entity_1.OrderStatus.PENDING;
            history.note = 'Order created';
            await queryRunner.manager.save(history);
            if (idempotencyKey) {
                const idempotencyEntity = new idempotency_key_entity_1.IdempotencyKey();
                idempotencyEntity.key = idempotencyKey;
                idempotencyEntity.orderId = savedOrder.id;
                await queryRunner.manager.save(idempotencyEntity);
            }
            await queryRunner.commitTransaction();
            return savedOrder;
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    findAll() {
        return this.orderRepo.find({ relations: { items: { product: true } } });
    }
    async findOne(id) {
        const order = await this.orderRepo.findOne({
            where: { id },
            relations: { items: { product: true } }
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${id} not found`);
        }
        return order;
    }
    async getHistory(orderId) {
        return this.historyRepo.find({ where: { orderId }, order: { createdAt: 'ASC' } });
    }
    async createPayment(orderId, method) {
        const order = await this.findOne(orderId);
        if (order.status === order_entity_1.OrderStatus.CANCELLED) {
            throw new common_1.BadRequestException('Cannot pay for a cancelled order');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const existingPayment = await queryRunner.manager.findOne(payment_entity_1.Payment, { where: { orderId, status: payment_entity_1.PaymentStatus.PAID } });
            if (existingPayment) {
                throw new common_1.BadRequestException('Order has already been paid');
            }
            const payment = new payment_entity_1.Payment();
            payment.orderId = orderId;
            payment.method = method;
            payment.amount = order.grandTotal;
            payment.transactionCode = 'TXN-' + Date.now();
            payment.status = payment_entity_1.PaymentStatus.PAID;
            const savedPayment = await queryRunner.manager.save(payment);
            const oldStatus = order.status;
            order.status = order_entity_1.OrderStatus.CONFIRMED;
            await queryRunner.manager.save(order);
            const history = new order_status_history_entity_1.OrderStatusHistory();
            history.orderId = orderId;
            history.fromStatus = oldStatus;
            history.toStatus = order_entity_1.OrderStatus.CONFIRMED;
            history.note = 'Payment successful';
            await queryRunner.manager.save(history);
            await queryRunner.commitTransaction();
            return savedPayment;
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async cancelOrder(orderId) {
        const order = await this.findOne(orderId);
        if (order.status === order_entity_1.OrderStatus.CANCELLED) {
            throw new common_1.BadRequestException('Order is already cancelled');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            for (const item of order.items) {
                const product = await queryRunner.manager.findOne(product_entity_1.Product, { where: { id: item.product.id } });
                if (product) {
                    product.quantity += item.quantity;
                    await queryRunner.manager.save(product);
                }
            }
            const oldStatus = order.status;
            order.status = order_entity_1.OrderStatus.CANCELLED;
            await queryRunner.manager.save(order);
            const history = new order_status_history_entity_1.OrderStatusHistory();
            history.orderId = orderId;
            history.fromStatus = oldStatus;
            history.toStatus = order_entity_1.OrderStatus.CANCELLED;
            history.note = 'Order cancelled and stock restored';
            await queryRunner.manager.save(history);
            await queryRunner.commitTransaction();
            return { message: 'Order cancelled successfully', order };
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async refundOrder(orderId) {
        const order = await this.findOne(orderId);
        const payment = await this.dataSource.manager.findOne(payment_entity_1.Payment, { where: { orderId } });
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            if (payment) {
                payment.status = payment_entity_1.PaymentStatus.REFUNDED;
                await queryRunner.manager.save(payment);
            }
            for (const item of order.items) {
                const product = await queryRunner.manager.findOne(product_entity_1.Product, { where: { id: item.product.id } });
                if (product) {
                    product.quantity += item.quantity;
                    await queryRunner.manager.save(product);
                }
            }
            const oldStatus = order.status;
            order.status = order_entity_1.OrderStatus.CANCELLED;
            await queryRunner.manager.save(order);
            const history = new order_status_history_entity_1.OrderStatusHistory();
            history.orderId = orderId;
            history.fromStatus = oldStatus;
            history.toStatus = 'REFUNDED';
            history.note = 'Order refunded and stock restored';
            await queryRunner.manager.save(history);
            await queryRunner.commitTransaction();
            return { message: 'Order refunded successfully', order };
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getRevenueStatistics(fromDate, toDate) {
        const query = this.orderRepo.createQueryBuilder('order');
        if (fromDate && toDate) {
            query.where('order.createdAt BETWEEN :from AND :to', {
                from: new Date(fromDate),
                to: new Date(toDate + 'T23:59:59'),
            });
        }
        const orders = await query.getMany();
        const totalOrders = orders.length;
        const paidOrders = orders.filter(o => o.status === order_entity_1.OrderStatus.CONFIRMED || o.status === order_entity_1.OrderStatus.COMPLETED);
        const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.grandTotal), 0);
        const totalDiscountGiven = orders.reduce((sum, o) => sum + Number(o.discountAmount), 0);
        return {
            fromDate: fromDate || 'All time',
            toDate: toDate || 'Now',
            totalOrders,
            paidOrdersCount: paidOrders.length,
            totalRevenue,
            totalDiscountGiven,
        };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(2, (0, typeorm_1.InjectRepository)(idempotency_key_entity_1.IdempotencyKey)),
    __param(3, (0, typeorm_1.InjectRepository)(order_status_history_entity_1.OrderStatusHistory)),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], OrdersService);
//# sourceMappingURL=orders.service.js.map