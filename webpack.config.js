const path = require('path');
const ENV = process.env.NODE_ENV || 'development';

module.exports = {
    mode: ENV === 'development' ? 'development' : 'production',
    entry: path.resolve(__dirname, 'src') + '/aria-autocomplete.js',
    output: {
        filename: 'aria-autocomplete.min.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    }
};
