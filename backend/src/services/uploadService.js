const ImageKit = require('@imagekit/nodejs');

const imagekit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY
});

const uploadToCloud = async (file) => {
    const result = await imagekit.files.upload({
        file: file.buffer.toString('base64'),
        fileName: "file_" + Date.now() + "_" + file.originalname,
        folder: "files/backend"
    });
    return result.url;
};

module.exports = {
    uploadToCloud
};