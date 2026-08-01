export interface CategoryResponse {
  id: number;
  name: string;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  description: string;
  gradient: string;
}

const CATEGORY_STYLES: Record<string, { icon: string; gradient: string }> = {
  'Electronics': {
    icon: 'laptop',
    gradient: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)'
  },
  'Books': {
    icon: 'book',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
  },
  'Books & Notes': {
    icon: 'book',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
  },
  'Furniture': {
    icon: 'armchair',
    gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
  },
  'Clothing': {
    icon: 'shirt',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'
  },
  'Clothing & Fashion': {
    icon: 'shirt',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'
  },
  'Accessories': {
    icon: 'bag',
    gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
  },
  'Services': {
    icon: 'wrench',
    gradient: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)'
  },
  'Campus Services': {
    icon: 'wrench',
    gradient: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)'
  }
};

const DEFAULT_STYLE = {
  icon: 'tag',
  gradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
};

export function mapCategoryResponseToCategory(res: CategoryResponse): Category {
  const style = CATEGORY_STYLES[res.name] || DEFAULT_STYLE;
  return {
    id: res.name.toLowerCase().replace(/\s+/g, '-'),
    name: res.name,
    icon: style.icon,
    count: 0,
    description: res.description || '',
    gradient: style.gradient
  };
}
