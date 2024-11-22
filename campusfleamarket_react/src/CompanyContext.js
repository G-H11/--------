import React, { createContext, useContext, useState } from 'react';

const CompanyContext = createContext();

export const useCompany = () => useContext(CompanyContext);

export const CompanyProvider = ({ children }) => {
  const [companyAddr, setCompanyAddr] = useState(null);

  return (
    <CompanyContext.Provider value={{ companyAddr, setCompanyAddr }}>
      {children}
    </CompanyContext.Provider>
  );
};
