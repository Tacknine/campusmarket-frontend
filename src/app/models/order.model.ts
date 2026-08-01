export interface OrderItemResponse {
  id: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
}

export interface OrderResponse {
  id: number;
  buyerId: number;
  sellerId: number;
  status: string;
  totalPrice: number;
  deliveryAddress: string;
  contactPhone: string;
  items: OrderItemResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  sellerId: number;
  deliveryAddress: string;
  contactPhone: string;
  items: {
    productId: number;
    productName: string;
    price: number;
    quantity: number;
  }[];
}
