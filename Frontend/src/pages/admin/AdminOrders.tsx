import { useNavigate } from 'react-router-dom';

const AdminOrders = () => {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<header className="bg-white shadow">
				<div className="px-8 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-3">
							<button 
								aria-label="Go back to dashboard" 
								onClick={() => navigate('/admin/dashboard')} 
								className="text-gray-700 hover:text-black text-2xl"
								title="Back to Dashboard"
							>
								←
							</button>
							<h1 className="text-3xl font-bold">Manage Orders</h1>
						</div>

						<div className="flex gap-2">
							<button 
								onClick={() => navigate('/admin/products')} 
								className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
							>
								Manage Products
							</button>
						</div>
					</div>
				</div>
			</header>

			<div className="p-6">
				<div className="bg-white rounded-lg shadow p-6">
					<p className="text-gray-600">Admin orders management will be implemented here.</p>
					<p className="text-gray-500 text-sm mt-2">Features: View orders, update order status, generate invoices, etc.</p>
				</div>
			</div>
		</div>
	);
}
export default AdminOrders;