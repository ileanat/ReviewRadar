import { useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
const environment = import.meta.env.VITE_CLIENT_ENV;

interface ProductData {
  product: {
    _id: string;
    name: string;
    key: string;
  };
  reviews: Array<{
    _id: string;
    username: string;
    review: string;
    rating: number;
    category: string;
  }>;
}
const ProductPage = () => {
  const { key } = useParams<{ key: string }>();
  const location = useLocation();
  const [data, setData] = useState<ProductData | null>(null);
  const passedName = location.state?.displayName;

  useEffect(() => {
    fetch(`${environment}/api/products/${key}`)
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Error:", err));
  }, [key]);
  if (!data) return (
                <div className="p-8 bg-white min-h-screen text-black">
                <h1 className="text-3xl font-bold mb-6 !bg-none ![-webkit-text-fill-color:black] text-">Loading Reviews...</h1>
                </div>
  );

  if (!data.product) {
  return (
    <div className="p-8 bg-white min-h-screen text-black">
      <h1 className="text-3xl font-bold mb-6 !bg-none ![-webkit-text-fill-color:black] text-">No reviews found</h1>
    </div>
  );
}

  return (
    <div className="p-8 bg-white min-h-screen text-black">
      <h1 className="text-3xl font-bold mb-6 !bg-none ![-webkit-text-fill-color:black] text-black">{passedName || data.product?.name || key}</h1>
      {data.reviews.map((rev) => (
        <div key={rev._id} className="border border-black-200 p-4 rounded-lg my-2 shadow-sm bg-white">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-yellow-500">★ {rev.rating}</span>
            <span className="text-sm text-black-500">by {rev.username}</span>
          </div>
          <p className="text-black-800">{rev.review}</p>
        </div>
      ))}
    </div>
  );
};
export default ProductPage;