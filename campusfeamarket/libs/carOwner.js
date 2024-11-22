// 定义一个函数来获取车主信息
const getCarOwner = async (address) => {
    // 加载 CarOwner.json 文件
    const response = await fetch('../compiled/CarOwner.json');
    const carOwnerJson = await response.json();

    // 创建 web3 实例
    const web3 = new Web3(window.web3.currentProvider);

    // 使用加载的 JSON 数据创建合约对象
    const carOwnerContract = new web3.eth.Contract(carOwnerJson.interface, address);
    
    return carOwnerContract;
};

// 将函数暴露出去，这样在 HTML 中就可以调用它
window.getCarOwner = getCarOwner;

