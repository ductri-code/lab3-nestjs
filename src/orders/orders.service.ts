import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, FindOptionsRelations } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { IdempotencyKey } from './entities/idempotency-key.entity';
import { Product } from '../products/entities/product.entity';
import { Coupon, DiscountType } from '../coupons/entities/coupon.entity';
import { Payment, PaymentMethod, PaymentStatus } from '../payments/entities/payment.entity';

@Injectable()
export class OrdersService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(IdempotencyKey)
    private idempotencyRepo: Repository<IdempotencyKey>,
    @InjectRepository(OrderStatusHistory)
    private historyRepo: Repository<OrderStatusHistory>,
  ) {}

  async createOrder(createOrderDto: any, idempotencyKey: string) {
    if (idempotencyKey) {
      const existingKey = await this.idempotencyRepo.findOne({ where: { key: idempotencyKey } });
      if (existingKey) {
        return this.orderRepo.findOne({
          where: { id: existingKey.orderId },
          relations: { items: { product: true } } as FindOptionsRelations<Order>,
        });
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let subtotal = 0;
      const orderItemsToSave: OrderItem[] = [];

      for (const itemDto of createOrderDto.items) {
        const product = await queryRunner.manager.findOne(Product, { where: { id: itemDto.productId } });
        if (!product) {
          throw new NotFoundException(`Product with ID ${itemDto.productId} not found`);
        }

        if (product.quantity < itemDto.quantity) {
          throw new BadRequestException(`Product '${product.name}' is out of stock (remaining: ${product.quantity})`);
        }

        product.quantity -= itemDto.quantity;
        await queryRunner.manager.save(product);

        const unitPrice = Number(product.price);
        subtotal += unitPrice * itemDto.quantity;

        const orderItem = new OrderItem();
        orderItem.product = product;
        orderItem.quantity = itemDto.quantity;
        orderItem.unitPrice = unitPrice;
        orderItemsToSave.push(orderItem);
      }

      let discountAmount = 0;
      let appliedCouponCode: string | null = null;

      if (createOrderDto.couponCode) {
        const coupon = await queryRunner.manager.findOne(Coupon, { where: { code: createOrderDto.couponCode } });
        if (!coupon) {
          throw new BadRequestException(`Coupon '${createOrderDto.couponCode}' does not exist`);
        }

        const now = new Date();
        if (!coupon.isActive || now < new Date(coupon.startAt) || now > new Date(coupon.endAt)) {
          throw new BadRequestException(`Coupon '${coupon.code}' is expired or inactive`);
        }

        if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
          throw new BadRequestException(`Coupon '${coupon.code}' has reached its usage limit`);
        }

        if (subtotal < Number(coupon.minOrderValue)) {
          throw new BadRequestException(`Order subtotal must be at least ${coupon.minOrderValue} to use this coupon`);
        }

        // CHALLENGE 2: Kiểm tra Coupon theo Category
        if (coupon.categoryId !== null && coupon.categoryId !== undefined) {
          for (const itemDto of createOrderDto.items) {
            const prod = await queryRunner.manager.findOne(Product, { where: { id: itemDto.productId } });
            if (prod && Number(prod.categoryId) !== Number(coupon.categoryId)) {
              throw new BadRequestException(`Coupon '${coupon.code}' is not applicable for this product category`);
            }
          }
        }

        // CHALLENGE 3: Giới hạn Coupon mỗi khách hàng theo số điện thoại
        if (createOrderDto.customerPhone) {
          const usedCountForPhone = await queryRunner.manager.count(Order, {
            where: {
              customerPhone: createOrderDto.customerPhone,
              couponCode: coupon.code,
            },
          });

          if (usedCountForPhone > 0) {
            throw new BadRequestException(`Customer with phone '${createOrderDto.customerPhone}' has already used this coupon`);
          }
        }

        let discount = 0;
        if (coupon.discountType === DiscountType.PERCENT) {
          discount = (subtotal * Number(coupon.discountValue)) / 100;
        } else {
          discount = Number(coupon.discountValue);
        }

        discountAmount = Math.min(discount, subtotal);
        coupon.usedCount += 1;
        await queryRunner.manager.save(coupon);
        appliedCouponCode = coupon.code;
      }

      // Challenge 1: Phí vận chuyển theo bậc thang giá trị đơn hàng
      let shippingFee = 0;
      if (subtotal < 500000) {
        shippingFee = 30000;
      } else if (subtotal < 1000000) {
        shippingFee = 15000;
      } else {
        shippingFee = 0;
      }

      const grandTotal = subtotal - discountAmount + shippingFee;

      const order = new Order();
      order.customerName = createOrderDto.customerName;
      order.customerPhone = createOrderDto.customerPhone;
      order.shippingAddress = createOrderDto.shippingAddress;
      order.couponCode = appliedCouponCode as string;
      order.status = OrderStatus.PENDING;
      order.subtotal = subtotal;
      order.discountAmount = discountAmount;
      order.shippingFee = shippingFee;
      order.grandTotal = grandTotal;
      order.items = orderItemsToSave;

      const savedOrder = await queryRunner.manager.save(order);

      const history = new OrderStatusHistory();
      history.orderId = savedOrder.id;
      history.fromStatus = 'NONE';
      history.toStatus = OrderStatus.PENDING;
      history.note = 'Order created';
      await queryRunner.manager.save(history);

      if (idempotencyKey) {
        const idempotencyEntity = new IdempotencyKey();
        idempotencyEntity.key = idempotencyKey;
        idempotencyEntity.orderId = savedOrder.id;
        await queryRunner.manager.save(idempotencyEntity);
      }

      await queryRunner.commitTransaction();
      return savedOrder;

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  findAll() {
    return this.orderRepo.find({ relations: { items: { product: true } } as FindOptionsRelations<Order> });
  }

  async findOne(id: number) {
    const order = await this.orderRepo.findOne({ 
      where: { id }, 
      relations: { items: { product: true } } as FindOptionsRelations<Order> 
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async getHistory(orderId: number) {
    return this.historyRepo.find({ where: { orderId }, order: { createdAt: 'ASC' } });
  }

  async createPayment(orderId: number, method: string) {
    const order = await this.findOne(orderId);
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot pay for a cancelled order');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingPayment = await queryRunner.manager.findOne(Payment, { where: { orderId, status: PaymentStatus.PAID } });
      if (existingPayment) {
        throw new BadRequestException('Order has already been paid');
      }

      const payment = new Payment();
      payment.orderId = orderId;
      payment.method = method as PaymentMethod;
      payment.amount = order.grandTotal;
      payment.transactionCode = 'TXN-' + Date.now();
      payment.status = PaymentStatus.PAID;
      const savedPayment = await queryRunner.manager.save(payment);

      const oldStatus = order.status;
      order.status = OrderStatus.CONFIRMED;
      await queryRunner.manager.save(order);

      const history = new OrderStatusHistory();
      history.orderId = orderId;
      history.fromStatus = oldStatus;
      history.toStatus = OrderStatus.CONFIRMED;
      history.note = 'Payment successful';
      await queryRunner.manager.save(history);

      await queryRunner.commitTransaction();
      return savedPayment;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async cancelOrder(orderId: number) {
    const order = await this.findOne(orderId);
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of order.items) {
        const product = await queryRunner.manager.findOne(Product, { where: { id: item.product.id } });
        if (product) {
          product.quantity += item.quantity;
          await queryRunner.manager.save(product);
        }
      }

      const oldStatus = order.status;
      order.status = OrderStatus.CANCELLED;
      await queryRunner.manager.save(order);

      const history = new OrderStatusHistory();
      history.orderId = orderId;
      history.fromStatus = oldStatus;
      history.toStatus = OrderStatus.CANCELLED;
      history.note = 'Order cancelled and stock restored';
      await queryRunner.manager.save(history);

      await queryRunner.commitTransaction();
      return { message: 'Order cancelled successfully', order };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // Challenge 4: API Hoàn tiền và hoàn kho (Refund) - Cập nhật tối ưu xử lý mượt mà
  async refundOrder(orderId: number) {
    const order = await this.findOne(orderId);
    
    // Tìm payment của đơn hàng này
    const payment = await this.dataSource.manager.findOne(Payment, { where: { orderId } });
    
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (payment) {
        payment.status = PaymentStatus.REFUNDED;
        await queryRunner.manager.save(payment);
      }

      // Hoàn trả lại số lượng tồn kho (quantity) cho sản phẩm
      for (const item of order.items) {
        const product = await queryRunner.manager.findOne(Product, { where: { id: item.product.id } });
        if (product) {
          product.quantity += item.quantity;
          await queryRunner.manager.save(product);
        }
      }

      const oldStatus = order.status;
      order.status = OrderStatus.CANCELLED;
      await queryRunner.manager.save(order);

      const history = new OrderStatusHistory();
      history.orderId = orderId;
      history.fromStatus = oldStatus;
      history.toStatus = 'REFUNDED';
      history.note = 'Order refunded and stock restored';
      await queryRunner.manager.save(history);

      await queryRunner.commitTransaction();
      return { message: 'Order refunded successfully', order };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // Challenge 5: Thống kê doanh thu
  async getRevenueStatistics(fromDate: string, toDate: string) {
    const query = this.orderRepo.createQueryBuilder('order');

    if (fromDate && toDate) {
      query.where('order.createdAt BETWEEN :from AND :to', {
        from: new Date(fromDate),
        to: new Date(toDate + 'T23:59:59'),
      });
    }

    const orders = await query.getMany();

    const totalOrders = orders.length;
    const paidOrders = orders.filter(o => o.status === OrderStatus.CONFIRMED || o.status === OrderStatus.COMPLETED);
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
}