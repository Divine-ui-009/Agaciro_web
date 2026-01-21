import api from './axios';
import type { Product } from '../types/Product';

const mapServerProduct = (item: any): Product => ({
    _id: item._id,
    name: item.proName || item.name || '',
    description: item.description || '',
    price: item.price ?? 0,
    category: item.category || '',
    stock: item.quantity ?? item.stock ?? 0,
    imageUrl: item.productImage || item.imageUrl || '',
    inStock: (item.quantity ?? item.stock ?? 0) > 0,
});

export const getProducts = async () => {
  const res = await api.get<Product[]>("/api/products");
  return res.data;
};

export const getProductById = async (id: string): Promise<Product> => {
    const res = await api.get(`/api/products/${id}`);
    return mapServerProduct(res.data);
};

export const addProduct = async (product: Omit<Product, '_id'>, imageFile?: File | null) => {
    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("description", product.description);
    formData.append("price", String(product.price));
    formData.append("quantity", String(product.stock));
    formData.append("category", product.category);
    
    if (imageFile) {
        formData.append("productImage", imageFile);
    }

    return await api.post("/api/products/", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const updateProduct = async (
    id: string, 
    product: Partial<Omit<Product, '_id'>>,
    imageFile?: File | null
) => {
    const formData = new FormData();
    
    if (product.name) formData.append("name", product.name);
    if (product.description) formData.append("description", product.description);
    if (product.price !== undefined) formData.append("price", String(product.price));
    if (product.stock !== undefined) formData.append("quantity", String(product.stock));
    if (product.category) formData.append("category", product.category);
    
    if (imageFile) {
        formData.append("productImage", imageFile);
    }

    return await api.put(`/api/products/${id}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

export const deleteProduct = async (id: string) => {
    return await api.delete(`/api/products/${id}`);
}