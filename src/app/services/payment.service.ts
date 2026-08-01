import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface PaymentResponse {
  id: number;
  orderId: number;
  amount: number;
  method: string;
  status: string;
  transactionId: string;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/payments`;

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

  // ✅ CASH PAYMENT
  recordCashPayment(orderId: number, amount: number): Observable<PaymentResponse> {
    return this.http.post<ApiResponse<PaymentResponse>>(
      `${this.baseUrl}`,
      { orderId, amount, method: 'CASH' },
      { headers: this.getHeaders() }
    ).pipe(map(res => res.data));
  }

  // ✅ M-PESA PAYMENT - With optional phone number
  recordMpesaPayment(orderId: number, amount: number, phoneNumber?: string, mpesaPassword?: string ): Observable<PaymentResponse> {
    const payload: any = { orderId, amount, method: 'MPESA' };
    if (phoneNumber) {
      payload.phoneNumber = phoneNumber;
    }
    return this.http.post<ApiResponse<PaymentResponse>>(
      `${this.baseUrl}`,
      payload,
      { headers: this.getHeaders() }
    ).pipe(map(res => res.data));
  }

  getPaymentByOrderId(orderId: number): Observable<PaymentResponse> {
    return this.http.get<ApiResponse<PaymentResponse>>(
      `${this.baseUrl}/order/${orderId}`,
      { headers: this.getHeaders() }
    ).pipe(map(res => res.data));
  }

  getBuyerPayments(): Observable<PaymentResponse[]> {
    return this.http.get<ApiResponse<PaymentResponse[]>>(
      `${this.baseUrl}`,
      { headers: this.getHeaders() }
    ).pipe(map(res => res.data));
  }
}