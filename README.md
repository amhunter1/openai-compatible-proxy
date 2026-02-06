# OpenAI-Compatible Proxy for Claude (Loratech)

A lightweight proxy server that converts OpenAI API requests to Claude API format, specifically designed to work with Loratech's Claude API endpoint.

## Features

- ✅ OpenAI-compatible `/v1/chat/completions` endpoint
- ✅ Streaming support
- ✅ Works with Loratech API (`https://api.loratech.dev`)
- ✅ Model mapping (gpt-4 → claude-3-5-sonnet, etc.)
- ✅ System message handling
- ✅ Usage statistics

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file:

```env
PORT=3000
PROVIDER=claude
ANTHROPIC_API_KEY=your_loratech_api_key_here
ANTHROPIC_BASE_URL=https://api.loratech.dev
```

## Usage

Start the server:

```bash
npm run dev
```

The proxy will be available at `http://localhost:3000`

## API Example

### Non-streaming request:

```bash
curl http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

### Streaming request:

```bash
curl http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Count from 1 to 10"}
    ],
    "stream": true
  }'
```

## Model Mapping

| OpenAI Model | Claude Model |
|-------------|--------------|
| gpt-4 | claude-3-5-sonnet-20241022 |
| gpt-4-turbo | claude-3-5-sonnet-20241022 |
| gpt-3.5-turbo | claude-3-5-haiku-20241022 |

## Use Cases

- Use Claude with OpenAI-compatible tools
- Integrate Claude into existing OpenAI workflows
- Test Claude responses with OpenAI client libraries

## Technical Details

- Built with Express.js and TypeScript
- Direct fetch-based implementation (no SDK dependencies)
- Proper header handling for Loratech API (`x-api-key`)
- SSE (Server-Sent Events) for streaming

## License

MIT
