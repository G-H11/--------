// 假设已经通过npm安装了web3库，并在文件的顶部导入了它  
import Web3 from 'web3';  
  
// 定义一个异步函数来加载合约  
async function loadContracts() {  
    try {  
        // 从服务器获取合约地址  
        const response = await fetch('../address.json');  
        const contractAddrArray = await response.json();  
  
        // 同时获取多个合约的ABI  
        const abiResponses = await Promise.all([  
            fetch('../compiled/BuyRecordList.json'),  
            fetch('../compiled/CompanyList.json'),  
            fetch('../compiled/CustomersOwnerList.json')  
        ]);  
  
        // 解析ABI数据  
        const [buyRecordListABI, companyListABI, customersOwnerListABI] = abiResponses.map(response => response.json());  
  
        // 等待ABI数据解析完成  
        const abis = await Promise.all(buyRecordListABI, companyListABI, customersOwnerListABI);  
  
        // 实例化Web3并连接到Ethereum提供者  
        if (typeof window.ethereum !== 'undefined') {  
            const web3 = new Web3(window.ethereum);  
  
            // 初始化合约实例  
            const buyRecordList = new web3.eth.Contract(abis[0], contractAddrArray[0]);  
            const companyList = new web3.eth.Contract(abis[2], contractAddrArray[2]);  
            const customersOwnerList = new web3.eth.Contract(abis[1], contractAddrArray[1]);  
  
            // 验证合约地址和ABI是否匹配，并输出到控制台  
            console.log("BuyRecordList address:", contractAddrArray[0]);  
            console.log("CompanyList address:", contractAddrArray[2]);  
            console.log("CustomersOwnerList address:", contractAddrArray[1]);  
  
            // 返回合约实例  
            return {  
                "BuyRecordList": buyRecordList,  
                "CompanyList": companyList,  
                "CustomersOwnerList": customersOwnerList,  
            };  
        } else {  
            throw new Error('Ethereum object not found in window');  
        }  
    } catch (error) {  
        console.error('Error loading contracts:', error);  
        throw error; // 可以选择重新抛出错误以便在调用处处理  
    }  
}  
  
// 当DOM内容加载完成后，调用loadContracts函数  
document.addEventListener('DOMContentLoaded', async () => {  
    try {  
        const contracts = await loadContracts();  
        // 在这里，你可以使用contracts对象来与你的智能合约进行交互  
        // 例如，你可以将contracts对象附加到window对象上，以便在其他地方使用它  
        window.Contracts = contracts;  
    } catch (error) {  
        console.error('Error loading contracts on DOMContentLoaded:', error);  
    }  
});  
  
// 如果你正在使用ES6模块，并且希望在其他文件中使用loadContracts函数，可以这样导出  
export default loadContracts;