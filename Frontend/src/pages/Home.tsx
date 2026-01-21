import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { getProducts } from "../api/ProductApi";
import api from "../api/axios";

import BackImage from "../assets/agaciro.jpeg";
import MapImage from "../assets/map.png";
import type { Product } from "../types/Product";

export default function Home() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [paused, setPaused] = useState<boolean>(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  
  const resolveImage = (url?: string): string => {
    if (!url) return "";
    if (url.startsWith("http")) return url;

    const base = (api.defaults.baseURL || "").replace(/\/api\/?$/, "");
    return base + url;
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getProducts();
        if (!mounted) return;

        setFeatured(data.slice(0, 8));
      } catch {
        // silent fail
      }
    })();

    return () => { 
      mounted = false; 
    };
  }, []);

  // Continuous auto-scroll using requestAnimationFrame
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let rafId: number;
    let lastTime = performance.now();
    const speed = 0.25; // px per ms (adjust for faster/slower)

    const onEnter = () => setPaused(true);
    const onLeave = () => setPaused(false);
    const touchOptions: AddEventListenerOptions = { passive: true };

    const step = (time: number) => {
      if (!paused) {
        const delta = time - lastTime;
        el.scrollLeft += speed * delta;

        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) {
          el.scrollLeft = 0;
        }
      }
      lastTime = time;
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('touchstart', onEnter, touchOptions);
    el.addEventListener('touchend', onLeave, touchOptions);

    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
      el.removeEventListener('touchstart', onEnter);
      el.removeEventListener('touchend', onLeave);
    };
  }, [paused]);

  return (
    <div className="min-h-screen bg-white flex flex-col"> 
      {/* HERO SECTION */}
      <section className="relative w-full h-[75vh] sm:h-[65vh] overflow-hidden">
        <img
          src={BackImage}
          alt="Agaciro Venture"
          className="w-full h-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center px-5 text-center">
          <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-3">
            Agaciro Ventures Shop
          </h1>

          <p className="text-white/90 text-sm sm:text-base max-w-xs sm:max-w-md mb-6">
            Your one-stop shop for quality goods at fair and affordable prices.
          </p>

          {/* Buttons */}
          <div className="w-full max-w-sm space-y-3">
            <button
             onClick={() => navigate("/products")}
             className="w-full py-3 rounded-xl bg-blue-600 text-white text-base font-semibold hover:bg-blue-700 transition"
            >
              Visit Shop
            </button>

            <button
            onClick={() => navigate("/login")}
            className="w-full py-3 rounded-xl bg-white text-blue-700 text-base font-semibold hover:bg-gray-200 transition"
            >
              Login
            </button>
          </div>
        </div>
      </section>

      {/* FEATURED HORIZONTAL SCROLL */}
      <section className="bg-white py-6 px-4">
        <h2 className="text-lg font-semibold mb-3">Featured</h2>
        <div className="-mx-4 px-4">
          <div ref={scrollRef} className="overflow-x-auto pb-3 touch-manipulation -mx-2 px-2">
            <div className="inline-flex items-center gap-3">
              {featured.length === 0 ? (
                <div className="bg-gray-100 rounded-lg h-36 w-36 animate-pulse" />
              ) : (
                featured
                  .filter((p) => p.imageUrl)
                  .map((p) => (
                    <div 
                      key={p._id} 
                      className="w-28 sm:w-36 rounded-lg overflow-hidden shadow-sm bg-white"
                    >
                      <img
                        src={resolveImage(p.imageUrl)}
                        alt={p.name}
                        className="w-full h-28 object-cover touch-manipulation"
                        onClick={() => navigate(`/products/${p._id}`)}
                        role="button"
                      />
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="bg-white py-10 px-5">
        <h2 className="text-lg font-bold text-center mb-6">Contact Us</h2>
        <div className="md:flex mx-auto ">
          <div className="max-w-md mx-auto space-y-4 text-sm text-gray-700">
            <div className="flex items-center gap-3">
              <span className="font-semibold">📞 Phone:</span>
              <a href="tel:+250785120615" className="text-blue-600">
                +250 785 120 615
              </a>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold">✉ Email:</span>
              <a
                href="mailto:agaciroventures@gmail.com"
                className="text-blue-600"
              >
                agaciroventures@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold">📍 Address:</span>
              <span title="Nyarugenge, kigali">Kigali, Rwanda</span>
            </div>
          </div>
          <div>
            <img
              src={MapImage}
              alt="map location"
              className="mx-auto rounded-sm"
            />
          </div>
        </div>
      </section>


      {/* FOOTER */}
      <footer className="mt-auto bg-gray-900 px-4 py-6 text-center">
        <p className="text-gray-400 text-xs sm:text-sm">
          © 2025 Agaciro Venture Ltd. Quality goods at wholesale prices.
        </p>
      </footer>

    </div>
  );
}
