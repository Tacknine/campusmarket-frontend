import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ProductResponse } from '../models/product.model';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/products`;

  constructor(private http: HttpClient) {}

  getProducts(): Observable<ProductResponse[]> {
    return this.http.get<ApiResponse<ProductResponse[]>>(this.baseUrl).pipe(
      map(res => res.data)
    );
  }

  getProductById(id: number): Observable<ProductResponse> {
    return this.http.get<ApiResponse<ProductResponse>>(`${this.baseUrl}/${id}`).pipe(
      map(res => res.data)
    );
  }
}
