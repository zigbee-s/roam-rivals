// utils/delayHelper.js

// Function to create a delay using setTimeout wrapped in a Promise
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  module.exports = { delay };
  