var MODULES = []; // 存放涉及到所有模块的信息，包含每个模块的url，依赖和回调
var STATUS = {}; // 模块的状态
var RESULTS = {}; // 模块的回调返回的结果
var STACK = []; // 当前待加载的模块栈

var LOADING = 1; // 加载中
var WAITING = 2; // 等待中
var DEFINED = 3; // 已定义

/**
 * 暴露出去的define接口
 * param {Fills} deps
 * param {Function} callback
 */
window.define = function (deps, callback) {
  var args = [].prototype.slice(arguments, 0);

  STACK.push(args);

  // 对页面中仍未被检测过的脚本进行处理
  var list = document.getElementsByTagName('script');
  for (var i = list.length - 1; i >= 0; i--) {
    var script = list[i];

    if (!script.nowhasloaded) {
      script.nowhasloaded = true;

      if (!script.src && script.innerHTML.search(/\s*define\s*\(/) >= 0) {
        // 内嵌模块定义语句脚本
        args = STACK.pop();
        while (args) {
          runLoading.apply(window, args);
          args = STACK.pop();
        }
      } else {
        //  外嵌模块定义语句脚本
        addScriptListener(list[i]);
      }
    }
  }
};

/**
 * 侦测脚本载入情况
 */
var addScriptListener = (function () {
  // 脚本载入完成回调
  var onScriptLoad = function (script) {
    var url = formatURL(script.src);
    if (!url) return;

    // 检查占中缓存
    var arr = STACK.pop();
    if (arr) {
      arr.unshift(url);
      runLoading.apply(window, arr);
    }
    // 当前模块不为等待中，则标记为已定义
    if (STATUS[url] !== WAITING)
      STATUS[url] = DEFINED;

    // 清理脚本节点
    if (script && script.parentNode) {
      // 清除脚本事件
      script.onload = script.onerror = null;

      // 移除script标签
      script.parentNode.removeChild(script);
    }
    // 加载完后检查等待中的模块
    runWaiting();
  };

  return function (script) {
    // 加载成功或失败
    script.onload = script.onerror = function (e) {
      onScriptLoad(e.target || e.scrElement || this);
    }
  };
})(script);

/**
 * 队等待中的模块进行定义
 */
var runWaiting = (function () {
  // 检查所有文件是否都载入
  var isFinishLoaded = function() {
    for (var url in STATUS) {
      if (STATUS[url] === LOADING) return false;
    }
    return true;
  };

  // 检查依赖列表是否都载入完成
  var isListLoaded = function(deps){
    for(var i = deps.length -1; i >= 0; i--) {
      if(STATUS[deps[i]] !== DEFINED) return false;
    }
    return true;
  };

  return function () {
    if (!MODULES.length) return;

    for (var i = MODULES.length-1; i >= 0; i--) {
      var item = MODULES[i];

      if (STATUS[item.url] !== DEFINED) {
        if (!isListLoaded(item.deps)) {
          // 存在未定义的文件，且依赖列表中也存在未定义的文件，跳过
        }
      }
    }
  }
})();