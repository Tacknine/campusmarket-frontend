import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DeliveryResponse {
  id: number;
  orderId: number;
  buyerId: number;
  sellerId: number;
  driverId: number;
  driverName: string;
  driverPhone: string;
  status: string;
  pickupAddress: string;
  deliveryAddress: string;
  currentLatitude: number;
  currentLongitude: number;
  currentLocationText: string;
  distanceRemaining: string;
  eta: string;
  estimatedDeliveryTime: string;
  actualDeliveryTime: string;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class TrackingService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/tracking`;

  constructor(private http: HttpClient) {}

  getDeliveryByOrderId(orderId: number): Observable<DeliveryResponse> {
    return this.http.get<ApiResponse<DeliveryResponse>>(`${this.baseUrl}/order/${orderId}`)
      .pipe(map(res => res.data));
  }

  getBuyerDeliveries(buyerId: number): Observable<DeliveryResponse[]> {
    return this.http.get<ApiResponse<DeliveryResponse[]>>(`${this.baseUrl}/buyer/${buyerId}`)
      .pipe(map(res => res.data));
  }
}
