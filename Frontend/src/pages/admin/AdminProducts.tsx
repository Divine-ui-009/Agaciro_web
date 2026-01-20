import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../../api/ProductApi';
import type { Product } from '../../types/Product';
import api from '../../api/axios';

const resolveImage = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const base = (api.defaults.baseURL || '').replace(/\/api\/?$/, '');
  return base + url;
}

export default function AdminProducts(){
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0,
    inStock: true,
  });

  useEffect(() => {
    setLoading(true);
    getProducts()
      .then((res) => setProducts(res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value) }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update existing product
        await updateProduct(editingId, {
          name: form.name,
          description: form.description,
          price: Number(form.price),
          category: form.category,
          stock: Number(form.stock),
          imageUrl: '',
          inStock: Boolean(form.inStock),
        }, imageFile || undefined);
      } else {
        // Add new product
        await addProduct({
          name: form.name,
          description: form.description,
          price: Number(form.price),
          category: form.category,
          stock: Number(form.stock),
          imageUrl: '',
          inStock: Boolean(form.inStock),
        }, imageFile);
      }
      
      // refresh list
      const updated = await getProducts();
      setProducts(updated || []);
      closeModal();
      alert(editingId ? 'Product updated successfully!' : 'Product added successfully!');
    } catch (err) {
      console.error('Failed to save product', err);
      alert('Failed to save product');
    }
  };

  const openEditModal = (product: Product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      inStock: product.inStock,
    });
    setImageFile(null);
    setImagePreview('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm({ name: '', description: '', price: 0, category: '', stock: 0, inStock: true });
    setImageFile(null);
    setImagePreview('');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        const updated = await getProducts();
        setProducts(updated || []);
        alert('Product deleted successfully!');
      } catch (err) {
        console.error('Failed to delete product', err);
        alert('Failed to delete product');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <button 
                aria-label="Go back to dashboard" 
                onClick={() => navigate('/admin/dashboard')} 
                className="text-gray-700 hover:text-black text-2xl"
                title="Back to Dashboard"
              >
                ←
              </button>
              <h1 className="text-3xl font-bold">Manage Products</h1>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => navigate('/admin/orders')} 
                className="text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                View Orders
              </button>
              <button 
                onClick={() => setShowModal(true)} 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                + Add Product
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">

      <section>
        {loading ? (
          <p className="text-center py-8">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-center py-8 text-gray-600">No products yet. Add your first product!</p>
        ) : (
          <div className="space-y-6 max-w-4xl">
            {products.map(p => {
              const imgSrc = resolveImage(p.imageUrl || '');
              return (
                <div key={p._id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Image */}
                    <div className="md:col-span-1">
                      {imgSrc ? (
                        <img src={imgSrc} alt={p.name} className="w-full h-48 object-cover rounded-lg" />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="md:col-span-3 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-xl mb-2">{p.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{p.description}</p>
                        {p.category && (
                          <p className="text-sm text-gray-500 mb-2">
                            <span className="font-medium">Category:</span> {p.category}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mb-3">
                          <p className="text-green-700 font-semibold text-lg">Rwf {p.price}</p>
                          <span className={`px-3 py-1 rounded text-sm font-medium ${p.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {p.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Stock:</span> {p.stock}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-4 border-t">
                        <button 
                          onClick={() => openEditModal(p)}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(p._id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center overflow-y-auto">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded w-full max-w-lg my-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{editingId ? 'Edit Product' : 'Add Product'}</h2>
              <button type="button" onClick={closeModal}>Close</button>
            </div>

            <label className="block mb-3">
              <span className="text-sm font-medium">Product Name *</span>
              <input name="name" value={form.name} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded mt-1" />
            </label>

            <label className="block mb-3">
              <span className="text-sm font-medium">Description</span>
              <textarea name="description" value={form.description} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded mt-1 h-20" />
            </label>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <label>
                <span className="text-sm font-medium">Price *</span>
                <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded mt-1" />
              </label>
              <label>
                <span className="text-sm font-medium">Stock *</span>
                <input name="stock" type="number" value={form.stock} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded mt-1" />
              </label>
            </div>

            <label className="block mb-3">
              <span className="text-sm font-medium">Category</span>
              <input name="category" value={form.category} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded mt-1" />
            </label>

            <label className="block mb-3">
              <span className="text-sm font-medium">Product Image</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="w-full p-2 border border-gray-300 rounded mt-1" />
            </label>

            {imagePreview && (
              <div className="mb-3">
                <p className="text-sm font-medium mb-2">Image Preview:</p>
                <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded" />
              </div>
            )}

            <label className="flex items-center mb-4">
              <input name="inStock" type="checkbox" checked={form.inStock} onChange={handleChange} className="w-4 h-4 mr-2" />
              <span className="text-sm">In stock</span>
            </label>

            <div className="mt-4 flex justify-end space-x-2">
              <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">{editingId ? 'Update Product' : 'Create Product'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}