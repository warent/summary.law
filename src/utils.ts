const SummaryPrompt = `
    You are an assistant that receives legal documents and writes articles about them for laypeople.
    Avoid using hyperbole or sensationalism. Skip introduction and pleasantries.
    Include dates when relevant.
    Provide the output in markdown format.
`

// Function to call Claude API for summarization using native fetch
export async function summarizePDFs(pdfBase64: string[]): Promise<any> {
    try {
        // Anthropic API key should be in .env file as ANTHROPIC_API_KEY
        const apiKey = process.env.ANTHROPIC_API_KEY;

        if (!apiKey) {
            throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 8192,
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: SummaryPrompt
                            },
                        ].concat(pdfBase64.map(pdf => ({
                            type: 'document',
                            source: {
                                type: 'base64',
                                media_type: 'application/pdf',
                                data: pdf
                            }
                        })) as any)
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        return data.content[0].text;
    } catch (error) {
        console.error('Error calling Anthropic API:', error);
        throw error;
    }
}

// Add TypeScript interface for the return type
export interface DocumentSummary {
    summary: string;
    keyPoints: string[];
    parties: string[];
    dates: string[];
}