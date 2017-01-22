module.exports = {
  devtool: "eval-source-map", // 配置生成Source Maps，选择合适的选项，兼具构建速度和完整的source map 
 
  entry:  "./statics/js/define.js",//已多次提及的唯一入口文件
  output: {
    path: "./statics/dist",//打包后的文件存放的地方
    filename: "bundle.js"//打包后输出文件的文件名
  },
  
  // 配置Loaders选项
  module: {
    rules: [
      {
        test: /\.json$/,
        loader: "json"
      },
      {
        test: /\.js$/,
        include: /node_modules/,
        loader: "babel", 
        options: {
          presets: ["es-2015"]
        }
      },
      {
        test: /\.css$/,
        include: /node_modules/,
        loader: "style!css"
      }
    ]
  },
  
  // 配置本地服务器选项
  devServer: {
    contentBase: "./statics/demos", // 本地服务器所加载的页面所在的目录
    colors: true, // 终端输出结果为彩色
    historyApiFallback: true, // 不跳转
    inline: true //实时刷新
  }
} 