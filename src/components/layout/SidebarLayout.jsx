import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiChevronDown, FiChevronUp, FiMenu, FiX } from "react-icons/fi";
import { useCallback, useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/auth/authSlice";

import { MdLogout } from "react-icons/md";
import { WithAuth } from "./WithAuth";
import { logoutUser } from "../../services/Lougout";

const AdminLayout = ({ children }) => {
  const [activeSection, setActiveSection] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectCurrentUser);
  console.log(user);
  const pathname = location.pathname;
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const sections = useMemo(
    () => [
      {
        name: "Dashboard",
        href: "/",
        icon: "📊",
      },
      {
        name: "Purchases",
        href: "/purchases",
        icon: "🛒",
        children: [
          {
            name: "List",
            href: "/purchases/list",
            icon: "📋",
          },

          {
            name: "Replace",
            href: "/purchases/return",
            icon: "🔍",
          },
        ],
      },
      {
        name: "Sale Analysis",
        href: "/sale-analysis",
        icon: "🔍",
      },
      {
        name: "Products",
        href: "/products",
        icon: "🛍️",
      },
      {
        name: "BR-Codes",
        href: "/br-codes",
        icon: "🔑",
      },
      {
        name: "Stocks",
        href: "/stock",
        icon: "🔑",
      },
      {
        name: "QR-Codes",
        href: "/qr-codes",
        icon: "🔑",
      },
      {
        name: "Sales",
        href: "/sales",
        icon: "💰",
      },
    ],
    [],
  );

  const isActiveUrl = useCallback(
    (url) => {
      return pathname === url;
    },
    [pathname],
  );

  const toggleSection = (sectionName) => {
    setActiveSection(activeSection === sectionName ? null : sectionName);
  };

  const handleNavigation = (href) => {
    navigate(href);
  };

  const [userEmail, setUserEmail] = useState(null);
  useEffect(() => {
    const email = localStorage.getItem("email");
    if (email) setUserEmail(email);
  }, []);

  const handleLogout = async () => {
    const success = await dispatch(logoutUser());
    console.log(success);
    if (success) navigate("/auth/login");
  };

  const Sidebar = () => (
    <div
      className={`bg-gray-800 no-print text-white h-full flex flex-col transition-all duration-300 ${
        isMobile ? "absolute inset-y-0 left-0 z-50 w-64" : "w-64"
      } ${
        isMobile && !isMobileMenuOpen ? "-translate-x-full" : "translate-x-0"
      }`}
    >
      <div className="p-4 border-b text-center border-gray-700">
        <h1 className="text-xl font-bold">POS Panel</h1>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {sections.map((section) => (
            <li key={section.name}>
              {section.children ? (
                <div>
                  <button
                    onClick={() => toggleSection(section.name)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      isActiveUrl(section.href) ||
                      section.children.some((child) => isActiveUrl(child.href))
                        ? "bg-blue-600 text-white"
                        : "hover:bg-gray-700"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span>{section.icon}</span>
                      <span>{section.name}</span>
                    </div>
                    {activeSection === section.name ? (
                      <FiChevronUp className="w-4 h-4" />
                    ) : (
                      <FiChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {activeSection === section.name && (
                    <ul className="ml-6 mt-2 space-y-1 border-l-2 border-gray-600 pl-4">
                      {section.children.map((child) => (
                        <li key={child.name}>
                          <button
                            onClick={() => handleNavigation(child.href)}
                            className={`w-full text-left flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                              isActiveUrl(child.href)
                                ? "bg-blue-500 text-white"
                                : "hover:bg-gray-700"
                            }`}
                          >
                            <span>{child.icon}</span>
                            <span>{child.name}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handleNavigation(section.href)}
                  className={`w-full text-left flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isActiveUrl(section.href)
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-700"
                  }`}
                >
                  <span>{section.icon}</span>
                  <span>{section.name}</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* User info + Logout */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-between space-x-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <MdLogout className="w-5 h-5 text-white" onClick={handleLogout} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Pos User</p>
              <p className="text-xs text-gray-400 truncate">{userEmail}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex  h-screen bg-gray-100">
      <Sidebar />

      {/* Mobile  */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className="flex-1 flex  flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white no-print shadow-sm border-b border-gray-200 z-30">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
              >
                {isMobileMenuOpen ? (
                  <FiX className="w-5 h-5 text-black" />
                ) : (
                  <FiMenu className="w-5 h-5 text-black" />
                )}
              </button>
              <div className="flex flex-col gap-0.5">
                <h1 className="text-lg font-semibold text-gray-800">
                  {sections.find(
                    (s) =>
                      s.href === pathname ||
                      s.children?.some((child) => child.href === pathname),
                  )?.name || "Dashboard"}
                </h1>
                <p className="text-sm font-medium truncate">
                  {user?.branchName} - {user?.branchAddress}
                </p>
              </div>
            </div>

            {/* <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-gray-600">🔔</span>
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-gray-600">⚙️</span>
              </button>
            </div> */}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 text-black ">
          <div>{children}</div>
        </main>
      </div>
    </div>
  );
};

const AdminLayoutWithAuth = WithAuth(AdminLayout);

// const AdminLayoutWithAuth = AdminLayout;
export default AdminLayoutWithAuth;
