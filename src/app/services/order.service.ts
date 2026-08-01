import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { OrderResponse, CreateOrderRequest } from '../models/order.model';
import { AuthService } from './auth.service';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ✅ ORDER SUMMARY INTERFACES
export interface OrderSummaryResponse {
  orderId: number;
  status: string;
  totalPrice: number;
  deliveryAddress: string;
  contactPhone: string;
  items: OrderSummaryItem[];
  payment: PaymentSummary;
  buyer: BuyerSummary;
  seller: SellerSummary;
  createdAt: string;
  updatedAt: string;
}

export interface OrderSummaryItem {
  id: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
  imageUrl?: string;
}

export interface PaymentSummary {
  method: string;
  status: string;
  amount: number;
  transactionId?: string;
  phoneNumber?: string;
}

export interface BuyerSummary {
  id: number;
  username?: string;
  email?: string;
  fullName?: string;
  phone?: string;
}

export interface SellerSummary {
  id: number;
  username?: string;
  email?: string;
  fullName?: string;
  phone?: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/orders`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // ✅ GET HEADERS WITH AUTH TOKEN
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getBuyerOrders(): Observable<OrderResponse[]> {
    return this.http.get<ApiResponse<OrderResponse[]>>(`${this.baseUrl}/buyer`).pipe(
      map(res => res.data)
    );
  }

  // ✅ GET ORDER SUMMARY - REKEBISHWA
  getOrderSummary(orderId: number): Observable<ApiResponse<OrderSummaryResponse>> {
    return this.http.get<ApiResponse<OrderSummaryResponse>>(
      `${this.baseUrl}/${orderId}/summary`,
      { headers: this.getHeaders() }
    );
  }

  getSellerOrders(): Observable<OrderResponse[]> {
    return this.http.get<ApiResponse<OrderResponse[]>>(`${this.baseUrl}/seller`).pipe(
      map(res => res.data)
    );
  }

  getOrderById(id: number): Observable<OrderResponse> {
    return this.http.get<ApiResponse<OrderResponse>>(`${this.baseUrl}/${id}`).pipe(
      map(res => res.data)
    );
  }

  createOrder(request: CreateOrderRequest): Observable<OrderResponse> {
    return this.http.post<ApiResponse<OrderResponse>>(this.baseUrl, request).pipe(
      map(res => res.data)
    );
  }

  acceptOrder(orderId: number): Observable<OrderResponse> {
    return this.http.post<ApiResponse<OrderResponse>>(`${this.baseUrl}/${orderId}/accept`, {}).pipe(
      map(res => res.data)
    );
  }

  rejectOrder(orderId: number): Observable<OrderResponse> {
    return this.http.post<ApiResponse<OrderResponse>>(`${this.baseUrl}/${orderId}/reject`, {}).pipe(
      map(res => res.data)
    );
  }

  cancelOrder(orderId: number): Observable<OrderResponse> {
    return this.http.post<ApiResponse<OrderResponse>>(`${this.baseUrl}/${orderId}/cancel`, {}).pipe(
      map(res => res.data)
    );
  }

  deliverOrder(orderId: number): Observable<OrderResponse> {
    return this.http.post<ApiResponse<OrderResponse>>(`${this.baseUrl}/${orderId}/deliver`, {}).pipe(
      map(res => res.data)
    );
  }

  completeOrder(orderId: number): Observable<OrderResponse> {
    return this.http.post<ApiResponse<OrderResponse>>(`${this.baseUrl}/${orderId}/complete`, {}).pipe(
      map(res => res.data)
    );
  }
}