var ExtractTextPlugin = require ('extract-text-webpack-plugin');

module.exports = {
    entry: "./src/SearchControl.js",
    output: {
        filename: "./dist/bundle.js",
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {        
        extensions: ["", ".webpack.js", ".web.js", ".js", ".jsx"]
    },

    module: {
        loaders: [            
            {
                test: /.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015']
                }
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loaders: [
                    'file?hash=sha512&digest=hex&name=[hash].[ext]',
                    'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
                ]
            },
        ],        
    },

    externals: {
        // "react": "React",
        // "react-dom": "ReactDOM",        
    },

    plugins: [   
        new ExtractTextPlugin('./dist/bundle.css')
    ]
};