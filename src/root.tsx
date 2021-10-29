import React, { useEffect } from "react";
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";

import { customTheme } from "theme";

import { App } from "./app";
// import { useAppUpdateChecker } from 'app-update-checker'
import { ProjectDataProvider } from "containers/project-data-container";
import { AuthProvider } from "containers/auth-container";

export const Root = () => {
  return (
    <ChakraProvider theme={customTheme} resetCSS={true}>
      <Router>
        <AppWithRouter />
      </Router>
    </ChakraProvider>
  );
};

// Routing side effects
// We cannot call `useLocation` from the previous component
// because the Router context has not been created yet
const AppWithRouter = (props) => {
  const location = useLocation();

  // useAppUpdateChecker({
  //   interval: 5 * 60 * 1000, // check for updates every 5 minutes
  //   isSimulationMode: false
  // })

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  return (
    <AuthProvider>
      <ProjectDataProvider>
        <App {...props} />
      </ProjectDataProvider>
    </AuthProvider>
  );
};
