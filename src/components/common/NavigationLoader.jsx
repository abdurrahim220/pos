import React, { useEffect } from "react";
import { useNavigation } from "react-router-dom";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

const NavigationLoader = ({ children }) => {
    const navigation = useNavigation();
    console.log(useNavigation());

  useEffect(() => {
      // console.log("loading");
    if (navigation.state === "loading") {
        
      NProgress.start(); // Start the loader
    } else {
      NProgress.done(); // End the loader
    }
  }, [navigation.state]);

  return <>{children}</>; // Render children
};

export default NavigationLoader;
