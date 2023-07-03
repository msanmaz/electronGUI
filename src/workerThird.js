
self.onmessage = function (event) {
    const { data, zeroSession } = event.data;
    let diffArray = [];

      diffArray = data.map(item => {
        let diff = {};
        for (let i = 1; i <= 16; i++) {
          diff[`c${i}`] = item[`c${i}`] - zeroSession[`c${i}`];
        }
        diff.counter = item.counter;
        diff.side = item.side;
        return diff;
      });
  
      diffArray = diffArray.filter((item) => item.counter % 5 === 0);
    
  
    self.postMessage(diffArray);
  }
  