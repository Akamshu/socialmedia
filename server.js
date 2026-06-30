require("dotenv").config();

const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.static("public"));

const API_KEY = process.env.API_KEY;

app.get("/analyze/:keyword", async (req, res) => {
    const keyword = req.params.keyword;

    try {
        // Search YouTube
        const search = await axios.get(
            "https://www.googleapis.com/youtube/v3/search",
            {
                params: {
                    part: "snippet",
                    q: keyword,
                    type: "video",
                    maxResults: 50,
                    key: API_KEY
                }
            }
        );

        const ids = search.data.items
            .map(item => item.id.videoId)
            .join(",");

        if (!ids) {
            return res.json([]);
        }

        // Get video statistics
        const stats = await axios.get(
            "https://www.googleapis.com/youtube/v3/videos",
            {
                params: {
                    part: "statistics,snippet",
                    id: ids,
                    key: API_KEY
                }
            }
        );

        const videos = stats.data.items.map(video => {

            const views = Number(video.statistics.viewCount || 0);
            const likes = Number(video.statistics.likeCount || 0);
            const comments = Number(video.statistics.commentCount || 0);

            const engagementScore =
                Math.round(
                    (likes * 2) +
                    (comments * 5) +
                    (views * 0.5)
                );

            let aiAnalysis = "";

            const engagementRate =
                views > 0
                    ? ((likes + comments) / views) * 100
                    : 0;

            if (engagementRate > 8) {
                aiAnalysis =
                    "This video ranks highly because it has exceptional audience engagement, indicating strong viewer interaction.";
            } else if (engagementRate > 5) {
                aiAnalysis =
                    "This video performs well with above-average engagement and consistent audience participation.";
            } else if (engagementRate > 2) {
                aiAnalysis =
                    "This video has moderate engagement but still attracts meaningful viewer interaction.";
            } else {
                aiAnalysis =
                    "This video relies more on views than audience interaction and has relatively low engagement.";
            }

            return {
                id: video.id,
                title: video.snippet.title,
                channel: video.snippet.channelTitle,
                thumbnail: video.snippet.thumbnails.high.url,
                uploadDate: video.snippet.publishedAt,
                url: `https://www.youtube.com/watch?v=${video.id}`,
                views,
                likes,
                comments,
                engagementScore,
                aiAnalysis
            };
        });

        videos.sort((a, b) => b.engagementScore - a.engagementScore);

        res.json(videos.slice(0, 3));

    } catch (err) {
        console.error(err.response?.data || err.message);
        res.status(500).json({
            error: "Unable to fetch YouTube data."
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});