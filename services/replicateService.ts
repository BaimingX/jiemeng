// Frontend service that calls the proxy server instead of Replicate directly
// This avoids CORS issues since browser cannot call Replicate API directly

const PROXY_URL = 'http://localhost:3001';

export const generateDreamCard = async (scenePrompt: string): Promise<string> => {
    console.log("Generating dream card with prompt:", scenePrompt);

    try {
        const response = await fetch(`${PROXY_URL}/api/generate-image`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: scenePrompt })
        });

        if (!response.ok) {
            throw new Error(`Proxy server error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.imageUrl) {
            throw new Error('No image URL returned from proxy');
        }

        return data.imageUrl;
    } catch (error) {
        console.error("Replicate Error:", error);
        throw error;
    }
};
