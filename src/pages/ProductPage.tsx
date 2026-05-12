import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
const environment = import.meta.env.VITE_CLIENT_ENV;

interface reviews {
  username: string;
  product: string; 
  review: string;
}

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const [data, setData] = useState<reviews | null>(null);
  const [loading, setLoading] = useState<boolean>(true);    
  const environment = import.meta.env.VITE_CLIENT_ENV;

    useEffect(() => {
    const fetchData = async () => {
        try {
        const response = await fetch(`${environment}/api/reviews/${id}`);
        
        if (!response.ok) throw new Error("Server Error");
        
        const result = await response.json();
        setData(result);
        } catch (error) {
        console.error("Fetch error:", error);
        }
    };

    if (id) fetchData();
    }, [id, environment]);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No record found.</div>;

  return (
    <div className="container">
      <h1>{data.product}</h1>
      <p>{data.review}</p>
    </div>
  );
};
export default ProductPage;
