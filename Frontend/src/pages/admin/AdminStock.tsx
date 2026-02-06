import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';

interface Product {
  _id: string;
  proName: string;
  quantity: number;
  price: number;
}

interface BulkItem {
  productId: string;
  productName: string;
  quantity: number;
  buyerName: string;
  reason: string;
}

const AdminStock = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  
  // Single product management
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [showProductList, setShowProductList] = useState(false);
  const [operation, setOperation] = useState<'add' | 'reduce'>('add');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [buyerName, setBuyerName] = useState('');
  
  // Bulk removal
  const [bulkItems, setBulkItems] = useState<BulkItem[]>([]);
  const [bulkProductSearch, setBulkProductSearch] = useState('');
  const [bulkShowList, setBulkShowList] = useState(false);
  const [bulkQuantity, setBulkQuantity] = useState('');
  const [bulkBuyerName, setBulkBuyerName] = useState('');
  const [bulkReason, setBulkReason] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    }
  };

  // SINGLE PRODUCT MANAGEMENT
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setSearchInput(product.proName);
    setShowProductList(false);
    setQuantity('');
    setReason('');
    setBuyerName('');
    setMessage('');
    setError('');
  };

  const filteredProducts = products.filter(p =>
    p.proName.toLowerCase().includes(searchInput.toLowerCase())
  );

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct) {
      setError('Please select a product');
      return;
    }

    if (!quantity || isNaN(Number(quantity)) || Number(quantity) < 0) {
      setError('Please enter a valid quantity');
      return;
    }

    if (operation === 'add') {
      if (!reason.trim()) {
        setError('Reason is required when adding stock');
        return;
      }
    } else {
      if (!buyerName.trim()) {
        setError('Buyer name is required when reducing stock');
        return;
      }
      
      if (selectedProduct.quantity < Number(quantity)) {
        setError(
          `Cannot reduce by ${quantity}. Current stock is only ${selectedProduct.quantity} units`
        );
        return;
      }
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/stock/update', {
        productId: selectedProduct._id,
        operation,
        quantity: Number(quantity),
        reason: reason.trim() || undefined,
        buyerName: buyerName.trim() || undefined
      });

      setMessage(response.data.message);
      
      setProducts(
        products.map(p => 
          p._id === selectedProduct._id 
            ? { ...p, quantity: response.data.product.quantity }
            : p
        )
      );

      setSelectedProduct({
        ...selectedProduct,
        quantity: response.data.product.quantity
      });

      setQuantity('');
      setReason('');
      setBuyerName('');
      
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update stock');
    } finally {
      setLoading(false);
    }
  };

  // BULK REMOVAL MANAGEMENT
  const handleAddBulkItem = (product: Product) => {
    if (!bulkQuantity || isNaN(Number(bulkQuantity)) || Number(bulkQuantity) < 0) {
      setError('Please enter a valid quantity');
      return;
    }

    if (product.quantity < Number(bulkQuantity)) {
      setError(
        `Cannot reduce by ${bulkQuantity}. Current stock is only ${product.quantity} units`
      );
      return;
    }

    const newBulkItem: BulkItem = {
      productId: product._id,
      productName: product.proName,
      quantity: Number(bulkQuantity),
      buyerName: '', // Will be added at submission time
      reason: bulkReason.trim()
    };

    // Check if item already exists, if so update it
    const existingIndex = bulkItems.findIndex(item => item.productId === product._id);
    if (existingIndex > -1) {
      const updatedItems = [...bulkItems];
      updatedItems[existingIndex] = newBulkItem;
      setBulkItems(updatedItems);
    } else {
      setBulkItems([...bulkItems, newBulkItem]);
    }

    setBulkProductSearch('');
    setBulkQuantity('');
    setBulkReason('');
    setBulkShowList(false);
    setError('');
  };

  const handleRemoveBulkItem = (productId: string) => {
    setBulkItems(bulkItems.filter(item => item.productId !== productId));
  };

  const handleSubmitBulkRemoval = async (e: React.FormEvent) => {
    e.preventDefault();

    if (bulkItems.length === 0) {
      setError('Please add at least one item');
      return;
    }

    if (!bulkBuyerName.trim()) {
      setError('Buyer name is required');
      return;
    }

    setLoading(true);

    try {
      // Add buyer name to all items
      const itemsWithBuyer = bulkItems.map(item => ({
        ...item,
        buyerName: bulkBuyerName.trim()
      }));

      const response = await axios.post('/api/stock/bulk-remove', {
        items: itemsWithBuyer
      });

      setMessage(`Successfully removed ${response.data.successCount} product(s) for ${bulkBuyerName}`);
      
      // Update products list
      fetchProducts();
      
      setBulkItems([]);
      setBulkProductSearch('');
      setBulkBuyerName('');
      setBulkReason('');
      
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process bulk removal');
    } finally {
      setLoading(false);
    }
  };

  const filteredBulkProducts = products.filter(p =>
    p.proName.toLowerCase().includes(bulkProductSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="px-4 md:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manage Stock</h1>
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className="text-gray-600 hover:text-gray-900 font-medium text-sm md:text-base"
          >
            Back
          </button>
        </div>
      </header>

      <div className="p-4 md:p-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 bg-white rounded-lg shadow p-2">
          <button
            onClick={() => setActiveTab('single')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition text-sm md:text-base ${
              activeTab === 'single'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Single Product
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition text-sm md:text-base ${
              activeTab === 'bulk'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Bulk Remove
          </button>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* SINGLE PRODUCT TAB */}
        {activeTab === 'single' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold mb-4">Update Stock</h2>

              <form onSubmit={handleUpdateStock} className="space-y-4">
                {/* Product Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Product
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => {
                        setSearchInput(e.target.value);
                        setShowProductList(true);
                      }}
                      onFocus={() => setShowProductList(true)}
                      placeholder="Search product..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {showProductList && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto z-20">
                        {filteredProducts.map(product => (
                          <button
                            key={product._id}
                            type="button"
                            onClick={() => handleProductSelect(product)}
                            className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b last:border-b-0 transition"
                          >
                            <div className="font-medium text-sm">{product.proName}</div>
                            <div className="text-xs text-gray-600">Stock: {product.quantity}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {selectedProduct && (
                  <>
                    {/* Current Quantity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Quantity
                      </label>
                      <input
                        type="number"
                        value={selectedProduct.quantity}
                        disabled
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 font-semibold"
                      />
                    </div>

                    {/* Operation Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Operation
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="operation"
                            value="add"
                            checked={operation === 'add'}
                            onChange={(e) => {
                              setOperation(e.target.value as 'add' | 'reduce');
                              setQuantity('');
                              setReason('');
                              setBuyerName('');
                              setError('');
                            }}
                            className="w-4 h-4 text-green-600"
                          />
                          <span className="ml-2 text-sm font-medium text-green-700">
                            Add Stock
                          </span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="operation"
                            value="reduce"
                            checked={operation === 'reduce'}
                            onChange={(e) => {
                              setOperation(e.target.value as 'add' | 'reduce');
                              setQuantity('');
                              setReason('');
                              setBuyerName('');
                              setError('');
                            }}
                            className="w-4 h-4 text-red-600"
                          />
                          <span className="ml-2 text-sm font-medium text-red-700">
                            Reduce Stock
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Quantity Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity to {operation === 'add' ? 'Add' : 'Remove'}
                      </label>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter quantity"
                      />
                    </div>

                    {/* Preview */}
                    {quantity && !isNaN(Number(quantity)) && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">New Stock:</span>{' '}
                          <span className="font-bold text-lg">
                            {operation === 'add'
                              ? selectedProduct.quantity + Number(quantity)
                              : selectedProduct.quantity - Number(quantity)}
                          </span>{' '}
                          units
                        </p>
                      </div>
                    )}

                    {/* Conditional Fields */}
                    {operation === 'add' ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reason for Adding Stock <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="e.g., New purchase, Supplier delivery"
                          rows={2}
                        />
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Buyer Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={buyerName}
                            onChange={(e) => setBuyerName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Who bought this?"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes (Optional)
                          </label>
                          <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Any additional notes"
                            rows={2}
                          />
                        </div>
                      </>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className={`flex-1 px-6 py-3 text-white rounded-lg transition font-medium disabled:opacity-50 text-sm md:text-base ${
                          operation === 'add'
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-red-600 hover:bg-red-700'
                        }`}
                      >
                        {loading ? 'Updating...' : `${operation === 'add' ? 'Add Stock' : 'Remove Stock'}`}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProduct(null);
                          setSearchInput('');
                        }}
                        className="flex-1 px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-medium text-sm md:text-base"
                      >
                        Clear
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        )}

        {/* BULK REMOVE TAB */}
        {activeTab === 'bulk' && (
          <div className="space-y-4">
            {/* Add Items Section */}
            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold mb-4">Add Items to Remove</h2>

              <form onSubmit={(e) => {
                e.preventDefault();
                const product = filteredBulkProducts[0];
                if (product) {
                  handleAddBulkItem(product);
                }
              }} className="space-y-4">
                {/* Product Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Product
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={bulkProductSearch}
                      onChange={(e) => {
                        setBulkProductSearch(e.target.value);
                        setBulkShowList(true);
                      }}
                      onFocus={() => setBulkShowList(true)}
                      placeholder="Search product..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    />
                    {bulkShowList && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto z-20">
                        {filteredBulkProducts.length > 0 ? (
                          filteredBulkProducts.map(product => (
                            <button
                              key={product._id}
                              type="button"
                              onClick={() => {
                                setBulkProductSearch(product.proName);
                                setBulkShowList(false);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-red-50 border-b last:border-b-0 transition text-sm"
                            >
                              <div className="font-medium">{product.proName}</div>
                              <div className="text-xs text-gray-600">Stock: {product.quantity}</div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-sm text-gray-600">No products found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quantity Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity to Remove
                  </label>
                  <input
                    type="number"
                    value={bulkQuantity}
                    onChange={(e) => setBulkQuantity(e.target.value)}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    placeholder="Enter quantity"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={bulkReason}
                    onChange={(e) => setBulkReason(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    placeholder="Any notes for this item"
                    rows={2}
                  />
                </div>

                {/* Add Button */}
                <button
                  type="button"
                  onClick={() => {
                    const product = filteredBulkProducts.find(p =>
                      p.proName.toLowerCase() === bulkProductSearch.toLowerCase()
                    );
                    if (product) {
                      handleAddBulkItem(product);
                    } else {
                      setError('Please select a valid product from the list');
                    }
                  }}
                  className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium text-sm md:text-base"
                >
                  + Add Item
                </button>
              </form>
            </div>

            {/* Items List */}
            {bulkItems.length > 0 && (
              <div className="bg-white rounded-lg shadow p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-semibold mb-4">
                  Items to Remove ({bulkItems.length})
                </h2>

                <div className="space-y-2">
                  {bulkItems.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-start justify-between gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm md:text-base">{item.productName}</p>
                        <p className="text-xs md:text-sm text-gray-600">
                          Qty: <span className="font-semibold">{item.quantity}</span>
                        </p>
                        {item.reason && (
                          <p className="text-xs text-gray-500 mt-1">{item.reason}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveBulkItem(item.productId)}
                        className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition font-medium text-xs flex-shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                {/* Buyer Name for All Items */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buyer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bulkBuyerName}
                    onChange={(e) => setBulkBuyerName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    placeholder="Who bought all these items?"
                  />
                  <p className="text-xs text-gray-500 mt-1">This buyer name will apply to all items above</p>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmitBulkRemoval}
                  disabled={loading}
                  className="w-full mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition font-medium text-sm md:text-base"
                >
                  {loading ? 'Processing...' : `Remove All (${bulkItems.length} items)`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quick Navigation */}
        <div className="mt-8 bg-white rounded-lg shadow p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Navigation</h2>
          <button 
            onClick={() => navigate('/admin/stock-history')}
            className="w-full md:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm md:text-base"
          >
            View Stock History
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminStock;
