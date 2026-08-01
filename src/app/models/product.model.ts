export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
  categoryName: string;
  sellerId: number;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  currency: string;
  category: string;
  condition: 'Like New' | 'Brand New' | 'Fair' | 'Good';
  image: string;
  description: string;
  stockQuantity: number;
  categoryId: number;
  sellerId: number;
  badge?: string;
  seller: {
    name: string;
    avatar: string;
    major: string;
    university: string;
    verified: boolean;
    rating: number;
  };
  location: string;
}

const PLACEHOLDER_IMAGES: Record<string, string> = {
  'Electronics': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
  'Books': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
  'Furniture': 'https://images.unsplash.com/photo-1580481072645-022f9a6d1270?auto=format&fit=crop&w=600&q=80',
  'Clothing': 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
  'Accessories': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
  'Services': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80',
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&w=600&q=80';

const CONDITIONS: Product['condition'][] = ['Like New', 'Brand New', 'Fair', 'Good'];

export function mapProductResponseToProduct(res: ProductResponse): Product {
  return {
    id: res.id,
    name: res.name,
    price: res.price,
    currency: 'TZS',
    category: res.categoryName,
    description: res.description,
    stockQuantity: res.stockQuantity,
    categoryId: res.categoryId,
    sellerId: res.sellerId,
    condition: CONDITIONS[res.id % CONDITIONS.length],
    image: PLACEHOLDER_IMAGES[res.categoryName] || DEFAULT_IMAGE,
    seller: {
      name: 'Student Seller',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
      major: 'Student',
      university: 'University',
      verified: true,
      rating: 4.5
    },
    location: 'Campus',
    ...(res.stockQuantity > 0 ? {} : { badge: 'Low Stock' })
  };
}
