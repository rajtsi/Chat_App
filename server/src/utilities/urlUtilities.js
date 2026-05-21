const publicIdExtractor = (url) => {
    if (!url) return null;
    const parts = url.split("/");
    const len = parts.length;
    if (len < 2) return null;
    const filename = parts[len - 1].split(".")[0];
    return parts[len - 2] + "/" + filename;

};

module.exports = {
    publicIdExtractor,
};