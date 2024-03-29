const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.tsx',
  mode: 'development',
  devtool: 'inline-source-map',
  output: {
    // path: path.resolve(__dirname, '../dist'),
    path: path.resolve('./dist'),
    filename: 'bundle.js',
    clean: true,
  },
  resolve: {
    extensions: [".ts", ".js", ".tsx", ".jsx"],
    alias: {
      react: path.resolve(__dirname, './node_modules/react'),
      '@': path.resolve(__dirname, './src/')  // '@' will point to 'src/' directory
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        // todo: this is so that we can have export const DBTypes in the backend
        // but it makes the bundle huge (i think)?
        // exclude: [/node_modules/, /backend/]
        exclude: [/node_modules/]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
        // use: ["css-loader"],
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
  ],
  devServer: {
    // contentBase: path.resolve(__dirname, 'dist'),
    hot: true,
  },
};
