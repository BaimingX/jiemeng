import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Replicate from 'replicate';

const app = express();
app.use(cors());
app.use(express.json());

// Check if API token is configured
const apiToken = process.env.REPLICATE_API_TOKEN;
if (!apiToken) {
    console.error('ERROR: REPLICATE_API_TOKEN is not set in .env file!');
}

const replicate = new Replicate({
    auth: apiToken
});

const STYLE_ANCHORS = `children's picture book illustration, wax crayon and watercolor, sketchy loose lines, vintage, off-white textured paper, soft warm pastel palette, naive perspective, simple shapes, gentle lighting, calm cozy mood, minimal details, no text, no logo, no watermark`;

const NEGATIVE_PROMPT = `avoid photorealistic, 3d render, anime, glossy, sharp clean vector lines, high contrast, cinematic, detailed skin pores, typography, readable text`;

app.post('/api/generate-image', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const fullPrompt = `${STYLE_ANCHORS}. ${prompt}. ${NEGATIVE_PROMPT}`;

        console.log('Generating image with prompt:', fullPrompt.substring(0, 100) + '...');

        const output = await replicate.run("prunaai/flux-fast", {
            input: {
                prompt: fullPrompt
            }
        });

        console.log('Replicate output type:', typeof output);

        // Get the URL from the output
        let imageUrl: string | undefined;
        if (output && typeof (output as any).url === 'function') {
            imageUrl = (output as any).url();
        } else if (typeof output === 'string') {
            imageUrl = output;
        } else if (Array.isArray(output) && output.length > 0) {
            const firstOutput = output[0];
            if (typeof firstOutput === 'string') {
                imageUrl = firstOutput;
            } else if (typeof (firstOutput as any).url === 'function') {
                imageUrl = (firstOutput as any).url();
            }
        }

        if (!imageUrl) {
            console.error('Unexpected output format:', output);
            throw new Error('Could not get image URL from Replicate response');
        }

        console.log('Generated image URL:', imageUrl);
        res.json({ imageUrl });
    } catch (error: any) {
        console.error('Image generation error:', error?.message || error);
        res.status(500).json({ error: error?.message || 'Failed to generate image' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
    console.log(`REPLICATE_API_TOKEN configured: ${apiToken ? 'Yes' : 'No'}`);
});
