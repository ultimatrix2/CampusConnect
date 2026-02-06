const axios = require("axios");
const cheerio = require("cheerio");

exports.getLinkPreview = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ success: false, message: "URL is required" });

        // 1. Fetch HTML
        const { data } = await axios.get(url, {
            headers: { "User-Agent": "Mozilla/5.0 (CampusConnectBot)" },
            timeout: 5000
        });

        // 2. Parse Metadata
        const $ = cheerio.load(data);
        const title = $('meta[property="og:title"]').attr('content') || $('title').text() || "";
        const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || "";
        const image = $('meta[property="og:image"]').attr('content') || "";
        const domain = new URL(url).hostname;

        res.json({
            success: true,
            preview: { url, title, description, image, domain }
        });

    } catch (error) {
        console.error("Link Preview Error:", error.message);
        // Don't fail the UI, just return empty preview
        res.json({ success: false, preview: null });
    }
};
