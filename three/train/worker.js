self.addEventListener("message", function (e) {
  const { id, name, action, state, data } = e.data;
});

// 发送通用interval定时器
setInterval(() => {
  self.postMessage({
    id: 100,
    name: "common_interval",
    action: "",
    state: "",
    data: {
      ts: Date.now(), // 当前时间戳，同一台设备，不同线程取的时间戳是可以互用的
    },
  });
}, 20);
