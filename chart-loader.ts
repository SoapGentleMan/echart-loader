// 导入 echarts 模块
const ec = require('echarts');
export function eChartsLoader(id, onSuccess = null) {
  let div: HTMLElement;
  if (id instanceof HTMLElement) {
    div = id;
  } else {
    div = document.getElementById(id);
  }
  if (!(div instanceof HTMLElement)) {
    throw new Error(`cant find an element where id = ${id}`);
  }
  // 声明 myChart 对象，供后续使用
  let myChart = null;

  // 因为是动态加载的 echarts，需要维护一个队列延迟处理
  const queue = [];
  let complete = false;
  const setReady = () => {
    complete = true;
    if (queue.length > 0) {
      let x;
      while (x = queue.shift()) {
        if (typeof x === 'function') {
          (function(fn) {
            setTimeout(() => {
              fn(myChart);
            });
          }(x));

        }
      }
    }
  };
  const ready = (fn) => {
    if (complete) {
      setTimeout(() => {
        fn(myChart);
      });
    } else {
      queue.push(fn);
    }
  };

  // 获取元素的当前长宽，用于后续检测尺寸变化
  let { width: rw, height: rh } = div.getBoundingClientRect();

  // 定时器，定期检测尺寸变化
  const timer = setInterval(() => {
    // 获取最新的宽高
    const { width, height } = div.getBoundingClientRect();

    if (myChart) {
      // 如果宽高发生变化，且 echarts 初始化完毕，通知尺寸变化
      if (width !== rw || height !== rh) {
        rw = width;
        rh = height;
        myChart.resize();
      }
    } else {
      // 如果 echarts 没有初始化，并且宽高都大于0，初始化 echarts
      if (width > 0 && height > 0) {
        myChart = ec.init(div);
        setReady();
      }
    }
  }, 1000 / 60);

  const destroy = () => {
    clearInterval(timer);
    ready(() => {
      myChart.dispose();
    });
  };
  if (typeof  onSuccess === 'function') {
    ready(onSuccess);
  }
  return {
    ready,
    destroy,
  };
}
