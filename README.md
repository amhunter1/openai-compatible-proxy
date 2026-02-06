# OpenAI-Compatible Multi-Provider Proxy

A lightweight proxy server that converts OpenAI API requests to multiple AI provider formats.

## Supported Providers

| Provider | Status | Models |
|----------|--------|--------|
| Claude (Anthropic) | ✅ | claude-3-5-sonnet, claude-3-5-haiku |
| OpenAI | ✅ | gpt-4, gpt-4-turbo, gpt-3.5-turbo |
| Google Gemini | ✅ | gemini-1.5-pro, gemini-1.5-flash |
| xAI (Grok) | ✅ | grok-beta |
| Mistral AI | ✅ | mistral-large, mistral-small |
| Cohere | ✅ | command-r-plus, command-r |
| Perplexity | ✅ | llama-3.1-sonar-large, llama-3.1-sonar-small |

## Features

- ✅ OpenAI-compatible `/v1/chat/completions` endpoint
- ✅ Streaming support for all providers
- ✅ Automatic model mapping
- ✅ System message handling
- ✅ Usage statistics
- ✅ Comprehensive error handling
- ✅ Structured logging
- ✅ Docker support
- ✅ Custom base URL support for all providers

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file with your provider credentials:

```env
# Server Configuration
PORT=3000
PROVIDER=claude
LOG_LEVEL=info

# Claude (Anthropic)
ANTHROPIC_API_KEY=your_anthropic_api_key
ANTHROPIC_BASE_URL=https://api.anthropic.com

# OpenAI
OPENAI_API_KEY=your_openai_api_key
OPENAI_BASE_URL=https://api.openai.com

# Google Gemini
GOOGLE_API_KEY=your_google_api_key
GOOGLE_BASE_URL=https://generativelanguage.googleapis.com

# xAI (Grok)
XAI_API_KEY=your_xai_api_key
XAI_BASE_URL=https://api.x.ai

# Mistral AI
MISTRAL_API_KEY=your_mistral_api_key
MISTRAL_BASE_URL=https://api.mistral.ai

# Cohere
COHERE_API_KEY=your_cohere_api_key
COHERE_BASE_URL=https://api.cohere.ai

# Perplexity
PERPLEXITY_API_KEY=your_perplexity_api_key
PERPLEXITY_BASE_URL=https://api.perplexity.ai
```

### Provider Selection

Set the `PROVIDER` environment variable to one of:
- `claude` or `anthropic` - Claude (Anthropic)
- `openai` - OpenAI
- `gemini` or `google` - Google Gemini
- `xai` or `grok` - xAI Grok
- `mistral` - Mistral AI
- `cohere` - Cohere
- `perplexity` - Perplexity

## Usage

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

### Docker

```bash
# Build the image
docker build -t openai-proxy .

# Run the container
docker run -p 3000:3000 --env-file .env openai-proxy
```

The proxy will be available at `http://localhost:3000`

## API Examples

### Non-streaming request

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

### Streaming request

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

### Health check

```bash
curl http://localhost:3000/health
```

## Model Mapping

The proxy automatically maps OpenAI model names to provider-specific models:

### Claude (Anthropic)
| OpenAI Model | Claude Model |
|-------------|--------------|
| gpt-4 | claude-3-5-sonnet-20241022 |
| gpt-4-turbo | claude-3-5-sonnet-20241022 |
| gpt-3.5-turbo | claude-3-5-haiku-20241022 |

### Google Gemini
| OpenAI Model | Gemini Model |
|-------------|--------------|
| gpt-4 | gemini-1.5-pro |
| gpt-4-turbo | gemini-1.5-pro |
| gpt-3.5-turbo | gemini-1.5-flash |

### xAI (Grok)
| OpenAI Model | Grok Model |
|-------------|------------|
| gpt-4 | grok-beta |
| gpt-4-turbo | grok-beta |
| gpt-3.5-turbo | grok-beta |

### Mistral AI
| OpenAI Model | Mistral Model |
|-------------|---------------|
| gpt-4 | mistral-large-latest |
| gpt-4-turbo | mistral-large-latest |
| gpt-3.5-turbo | mistral-small-latest |

### Cohere
| OpenAI Model | Cohere Model |
|-------------|--------------|
| gpt-4 | command-r-plus |
| gpt-4-turbo | command-r-plus |
| gpt-3.5-turbo | command-r |

### Perplexity
| OpenAI Model | Perplexity Model |
|-------------|------------------|
| gpt-4 | llama-3.1-sonar-large-128k-online |
| gpt-4-turbo | llama-3.1-sonar-large-128k-online |
| gpt-3.5-turbo | llama-3.1-sonar-small-128k-online |

## Use Cases

- Use multiple AI providers with OpenAI-compatible tools
- Integrate various AI models into existing OpenAI workflows
- Test different AI providers with OpenAI client libraries
- Switch between providers without changing client code
- Compare responses from different AI models

## Technical Details

- Built with Express.js and TypeScript
- Direct fetch-based implementation (no SDK dependencies)
- Provider-specific error handling and logging
- SSE (Server-Sent Events) for streaming
- Structured logging with Winston
- Docker support for easy deployment

## Error Handling

The proxy provides comprehensive error handling with:
- Provider-specific error messages
- HTTP status code mapping
- Detailed error logging
- OpenAI-compatible error responses

## Logging

Logs are written to:
- Console (all levels)
- `logs/error.log` (errors only)
- `logs/combined.log` (all logs)

Log levels: `error`, `warn`, `info`, `debug`

## License

MIT
