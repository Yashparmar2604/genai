import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CheckAuth({ children, protected: isProtected }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (isProtected && !token) {
      navigate("/login");
    } else if (!isProtected && token) {
      navigate("/");
    } else {
      setLoading(false);
    }
  }, [isProtected, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return children;
}

export default CheckAuth;