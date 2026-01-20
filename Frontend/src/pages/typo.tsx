import { useNavigate } from 'react-router-dom';
import BackImage from "../assets/agaciro-image.jpg";

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* Hero - mobile first */}
            <section className='relative w-full h-[50vh] md:h-[60vh] overflow-hidden'>
                <img 
                    src={BackImage} 
                    alt="Agaciro Venture Image" 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center px-6">
                    <h2 className="text-white text-base md:text-lg mb-1">Welcome to</h2>
                    <h1 className="text-white text-2xl md:text-4xl font-bold mb-3 text-center">Agaciro Ventures Ltd</h1>
                    <p className="text-white/90 text-sm md:text-lg mb-4 max-w-xs md:max-w-md text-center">
                        Quality goods, fair prices — delivered to your neighbourhood.
                    </p>
                    <div className="w-full max-w-xs md:max-w-sm space-y-2">
                        <button 
                            onClick={() => navigate('/products')}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                            Visit Shop
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className='w-full bg-white text-blue-800 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2'
                        >
                            Login
                        </button>
                    </div>
                </div>
            </section>

            {/* About + Contacts - stacked and mobile-optimized */}
            <main className="px-4 py-6 space-y-6 md:px-8 md:py-12">
                <section className="bg-gray-50 rounded-lg p-4 md:p-6">
                    <h2 className="text-lg font-semibold mb-2">About Us</h2>
                    <p className="text-sm text-gray-700 leading-relaxed">
                        Agaciro Ventures is a locally rooted retailer supplying quality household goods, groceries and
                        essentials at competitive prices. We focus on quick delivery, friendly service, and supporting
                        local suppliers. Our mobile-first experience makes it easy to shop on the go.
                    </p>
                </section>

                <section className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
                    <h2 className="text-lg font-semibold mb-2">Contact</h2>
                    <p className="text-sm text-gray-700">Have a question or an order? Reach out to us:</p>

                    <div className="mt-3 grid grid-cols-1 gap-3 text-sm">
                        <div className="flex items-start gap-3">
                            <span className="font-medium">Phone:</span>
                            <a href="tel:+250790096244" className="text-blue-600">+250 790 096 244</a>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="font-medium">Email:</span>
                            <a href="mailto:info@agaciro.example" className="text-blue-600">info@agaciro.example</a>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="font-medium">Address:</span>
                            <span className="text-gray-700">Kigali, Rwanda</span>
                        </div>
                    </div>

                    <div className="mt-4">
                        <a href="/contact" className="inline-block bg-green-600 text-white px-4 py-2 rounded">Contact Us</a>
                    </div>
                </section>

                <section className="text-center text-gray-500 text-sm pt-4">
                    <p>© 2025 Agaciro Venture Ltd. Quality goods at wholesale prices.</p>
                </section>
            </main>
        </div>
    )
}