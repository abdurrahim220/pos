import React from "react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/Loading";
import { userLoggedIn } from "../../features/auth/authSlice";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (isAuthenticated && token) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/pos-users/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "include",
        }
      );

      const data = await res.json();
      setIsLoading(false);

      if (data.success) {
        const { user, token } = data;
        localStorage.setItem("authToken", token);
        dispatch(userLoggedIn({ user, token }));
        navigate("/");
      } else {
        toast.error(data?.message || "Login failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while logging in");
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="lg:w-1/2 lg:block hidden">
        <div className="flex items-center flex-col h-full justify-center">
          <img style={{ objectFit: "contain" }} src={"/logo.png"} alt="Image" />
        </div>
      </div>
      <div className="lg:w-2/6 p-8 rounded-xl shadow-lg w-96 space-y-5  bg-white">
        <h2 className="text-4xl font-bold mb-4 text-black text-center">
          POS Login
        </h2>

        <form onSubmit={handleSubmit} className="py-10">
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="text"
              id="email"
              className="w-full p-2 border text-black border-gray-300 rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full p-2 border text-black border-gray-300 rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
