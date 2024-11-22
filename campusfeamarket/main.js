// main.js  
import data from './libs/accidentDescribe.js'; // 假设data.js与main.js在同一目录下  
  
// 在这里可以使用data对象  
console.log(data.site);  
  
// 或者你可以将data对象中的某个属性附加到window对象上，以便在全局范围内访问  
window.myData = data;