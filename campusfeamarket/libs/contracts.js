async function loadContracts() {
    // Fetch address.json and compiled JSON files
    const response = await fetch('../address.json');
    const contractAddrArray = await response.json();

    const [
      BuyRecordList,
      CompanyList,
      CustomersOwnerList
    ] = await Promise.all([
      fetch('../compiled/BuyRecordList.json').then(response => response.json()),
      fetch('../compiled/CompanyList.json').then(response => response.json()),
      fetch('../compiled/CustomersOwnerList.json').then(response => response.json())
    ]);

    const web3 =await new Web3(window.ethereum);
    const buyRecordList =await new web3.eth.Contract(BuyRecordList.abi, contractAddrArray[0]);
    const customersOwnerList =await new web3.eth.Contract(CustomersOwnerList.abi, contractAddrArray[1]);
    const companyList =await new web3.eth.Contract(CompanyList.abi, contractAddrArray[2]);

    console.log("contractAddrArray[0]",contractAddrArray[0])
    console.log("contractAddrArray[1]",contractAddrArray[1])
    console.log("contractAddrArray[2]",contractAddrArray[2])
 
    return{
      "BuyRecordList": buyRecordList,
      "CustomersOwnerList": customersOwnerList,
      "CompanyList": companyList
    }
}

// Call loadContracts() function to load contracts when the DOM content is loaded
document.addEventListener('DOMContentLoaded', loadContracts);

// export default window.Contracts;

