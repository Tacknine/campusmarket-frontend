import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { CategoryResponse } from '../models/category.model';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/categories`;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<CategoryResponse[]> {
    return this.http.get<ApiResponse<CategoryResponse[]>>(this.baseUrl).pipe(
      map(res => res.data)
    );
  }
}
