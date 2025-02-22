const SummaryPrompt = `
    You are an assistant that receives legal documents and writes articles about them for laypeople.
    Avoid using hyperbole or sensationalism. Skip introduction and pleasantries.
    Include dates when relevant.
    The article should be written in Markdown format.

    Along with this, you need to provide a "curation score" for the case to indicate the quality and substance of the case.
    The curation score should be an integer between 0 and 100, and will help determine if the case is worth covering.
    We want to cover cases of substance, are executed professionally, and are important to the public interest, such as those involving corporate misconduct, government corruption, or civil rights.

    Your output should be in JSON format, as follows:
    {
        "summary": "Markdown summary of the case",
        "curationScore": 0-100
    }
`

export type SummaryResult = {
    summary: string;
    curationScore: number;
}

// Function to call Claude API for summarization using native fetch
export async function summarizePDFs(pdfBase64: string[]): Promise<SummaryResult> {
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
        const result = JSON.parse(data.content[0].text);
        return result;
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