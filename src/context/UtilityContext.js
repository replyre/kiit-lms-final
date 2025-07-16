import { createContext, useContext, useState } from "react";

const UtilityContext = createContext({
  activeSection: "Dashboard",
  currentModuleIndex: 0,
  setCurrentModuleIndex: () => {},
  setActiveSection: () => {},
});

export const useUtilityContext = () => {
  const context = useContext(UtilityContext);
  if (!context) {
    throw new Error("useUtility must be used within a UtilityProvider");
  }
  return context;
};

const UtilityProvider = ({ children }) => {
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  return (
    <UtilityContext.Provider
      value={{
        activeSection,
        setActiveSection,
        currentModuleIndex,
        setCurrentModuleIndex,
      }}
    >
      {children}
    </UtilityContext.Provider>
  );
};

export default UtilityProvider;
