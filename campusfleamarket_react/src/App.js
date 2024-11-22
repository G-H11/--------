import React from 'react';  
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Login from './Login';
import Register from './Registrat';

import Company from './Company ';
import BrowseProducts from './BrowseProducts';
import ProductForm from './ProductForm';
import ModifyProductComponent from './ModifyProducts';
import BalanceComponent from './Companyblance';
import CreditwortComponent from './CreditwordCompany';

import CustomersOwner from './CustomersOwner';
import BuyProduct from './BuyProduct';
import AddCustomerForm from './AddCustomerForm ';
import BalanceCustomer from './Customerblance';
import CreditwortCustomer from './CreditwordCustomer';

class App extends React.Component {
  render()
  {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login></Login>}></Route>
          <Route path="/registration" element={<Register></Register>}></Route>

          <Route path="/company" element={<Company></Company>}>
            <Route index element={<BrowseProducts/>}/>
            <Route path="showProduct" element={<BrowseProducts></BrowseProducts>}/> 
            <Route path="productForm" element={<ProductForm></ProductForm>}/> 
            <Route path="modify" element={<ModifyProductComponent></ModifyProductComponent>}/> 
            <Route path="comblance" element={<BalanceComponent></BalanceComponent>}/> 
            <Route path="creditCompany" element={<CreditwortComponent></CreditwortComponent>}/> 

          </Route>
          <Route path="/customersOwner" element={<CustomersOwner></CustomersOwner>}>
            <Route index element={<BuyProduct/>}/>
            <Route path="buyProduct" element={<BuyProduct></BuyProduct>}/>
            <Route path="adduser" element={<AddCustomerForm></AddCustomerForm>}/>
            <Route path="cusblance" element={<BalanceCustomer></BalanceCustomer>}/> 
            <Route path="creditCustomer" element={<CreditwortCustomer></CreditwortCustomer>}/> 
          </Route>
        </Routes>
      </BrowserRouter>
    )
  }
}

export default App;
