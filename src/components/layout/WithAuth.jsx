import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function WithAuth(Component) {
  const Wrapper = (props) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
      if (location.pathname === "/auth/login") return;

      const token = localStorage.getItem("authToken");

      if (!token) {
        navigate("/auth/login");
      } else {
        setIsAuthenticated(true);
      }
    }, [navigate, location.pathname]);

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };

  Wrapper.displayName = `WithAuth(${Component.displayName || Component.name})`;

  return Wrapper;
}
