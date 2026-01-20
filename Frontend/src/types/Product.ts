export interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    imageUrl?: string;
    inStock: boolean;
}