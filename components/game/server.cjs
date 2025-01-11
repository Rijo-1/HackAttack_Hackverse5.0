const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/mint-nft', async (req, res) => {
    const { recipientAddress, metadata } = req.body;

    const apiKey = "sk_staging_5jzSoFuMxJsg3fknVJAH8NecdauV3thHD8wkitfgcZCL2RetR23PJqXw3hGubsCyZu7RCQzCGAqx2D5BTWAKao7Rvd48oHytJghmVZtd7FLELgCTC89M8R16dvk2B6wnZuxTnuYGeF9QgPVsFQ3DA1yAaJrUTaKZkYraXXBcLo4JBYTeLptsN1zRcqNgbw7mTEoofyRow1WghPfp24C1ckxk"; // Replace with your actual API key
    const url = `https://staging.crossmint.com/api/2022-06-09/collections/default/nfts`;

    try {
        const response = await axios.post(url, {
            recipient: recipientAddress,
            metadata: metadata,
        }, {
            headers: {
                accept: "application/json",
                "content-type": "application/json",
                "x-api-key": apiKey,
            },
        });

        res.json(response.data);
    } catch (error) {
        console.error("Error minting NFT:", error);
        res.status(500).json({ error: 'Failed to mint NFT' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
