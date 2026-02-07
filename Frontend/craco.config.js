const path = require('path');

module.exports = {
    webpack: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    devServer: {
        client: {
            overlay: {
                runtimeErrors: (error) => {
                    if (error.message && error.message.includes('ResizeObserver')) {
                        return false;
                    }
                    return true;
                },
            },
        },
    },
};
