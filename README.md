# OpenAI-Compatible Multi-Provider Proxy

A lightweight, production-ready proxy server that converts OpenAI API requests to multiple AI provider formats. Built with TypeScript, Express.js, and comprehensive error handling.

## 🚀 Supported Providers

| Provider | Status | Latest Models | Streaming | Vision |
|----------|--------|---------------|-----------|--------|
| **Claude (Anthropic)** | ✅ | Opus 4.6, Sonnet 4.5, Haiku 4.5 | ✅ | ✅ |
| **OpenAI** | ✅ | GPT-4, GPT-4 Turbo, GPT-3.5 Turbo | ✅ | ✅ |
| **Google Gemini** | ✅ | Gemini 3 Pro, Gemini 3 Flash, Gemini 2.5 Pro/Flash | ✅ | ✅ |
| **xAI (Grok)** | ✅ | Grok 2, Grok 2 Mini | ✅ | ✅ |
| **Mistral AI** | ✅ | Mistral Large 2, Mistral Small, Pixtral | ✅ | ✅ |
| **Cohere** | ✅ | Command R+, Command R | ✅ | ❌ |
| **Perplexity** | ✅ | Sonar Pro, Sonar, Sonar Reasoning | ✅ | ❌ |

## ✨ Features

- ✅ **OpenAI-Compatible API** - Drop-in replacement for OpenAI API
- ✅ **Multi-Provider Support** - 7 AI providers with unified interface
- ✅ **Streaming Support** - Real-time responses with SSE
- ✅ **Automatic Model Mapping** - Use OpenAI model names with any provider
- ✅ **Vision Support** - Image understanding for compatible models
- ✅ **Comprehensive Error Handling** - Provider-specific error messages
- ✅ **Structured Logging** - Winston-based logging with file rotation
- ✅ **Docker Support** - Production-ready containerization
- ✅ **Custom Base URLs** - Use custom endpoints for each provider
- ✅ **Health Checks** - Built-in health monitoring endpoint
- ✅ **TypeScript** - Full type safety and IntelliSense support

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/amhunter1/openai-compatible-proxy.git
cd openai-compatible-proxy

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

## ⚙️ Configuration

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

### Log Levels

Set `LOG_LEVEL` to control logging verbosity:
- `error` - Only errors
- `warn` - Warnings and errors
- `info` - General information (default)
- `debug` - Detailed debugging information

## 🚀 Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

### Docker Deployment

```bash
# Build the image
docker build -t openai-proxy .

# Run the container
docker run -p 3000:3000 --env-file .env openai-proxy

# Or use docker-compose
docker-compose up -d
```

The proxy will be available at `http://localhost:3000`

## 📡 API Examples

### Basic Chat Completion

```bash
curl http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "What is the capital of France?"}
    ]
  }'
```

### Streaming Response

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

### Vision Request (Image Understanding)

```bash
curl http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {
        "role": "user",
        "content": [
          {"type": "text", "text": "What is in this image?"},
          {"type": "image_url", "image_url": {"url": "https://example.com/image.jpg"}}
        ]
      }
    ]
  }'
```

### Health Check

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "provider": "claude",
  "timestamp": "2026-02-06T12:00:00.000Z"
}
```

## 🔄 Model Mapping

The proxy automatically maps OpenAI model names to provider-specific models. You can use standard OpenAI model names (`gpt-4`, `gpt-4-turbo`, `gpt-3.5-turbo`) with any provider.

### Claude (Anthropic)

**Latest Models (February 2026)**

| OpenAI Model | Claude Model | Context | Max Output | Features |
|-------------|--------------|---------|------------|----------|
| gpt-4 | claude-opus-4-6 | 200K / 1M tokens | 128K tokens | Most intelligent, best for agents & coding |
| gpt-4-turbo | claude-sonnet-4-5-20250929 | 200K / 1M tokens | 64K tokens | Best speed/intelligence balance |
| gpt-3.5-turbo | claude-haiku-4-5-20251001 | 200K tokens | 64K tokens | Fastest with near-frontier intelligence |

**Key Features:**
- Extended thinking mode for complex reasoning
- Adaptive thinking (Opus 4.6 only)
- Vision support (images)
- Multilingual capabilities
- Knowledge cutoff: May 2025 (Opus), Jan 2025 (Sonnet), Feb 2025 (Haiku)

**Pricing:**
- Opus 4.6: $5/MTok input, $25/MTok output
- Sonnet 4.5: $3/MTok input, $15/MTok output
- Haiku 4.5: $1/MTok input, $5/MTok output

### Google Gemini

**Latest Models (February 2026)**

| OpenAI Model | Gemini Model | Context | Features |
|-------------|--------------|---------|----------|
| gpt-4 | gemini-3-pro-preview | 1M tokens | Best multimodal understanding, agentic coding |
| gpt-4-turbo | gemini-3-flash-preview | 1M tokens | Balanced speed and intelligence |
| gpt-3.5-turbo | gemini-2.5-flash | 1M tokens | Optimized for price-performance |

**Alternative Models:**
- `gemini-2.5-pro` - State-of-the-art thinking model for complex reasoning
- `gemini-2.5-flash-lite` - Fastest, most cost-efficient model

**Key Features:**
- Multimodal: text, image, video, audio, PDF inputs
- Thinking and agentic capabilities
- Large context windows (1M tokens)
- Code, math, and STEM analysis
- Updated: November 2025 (Gemini 3 Pro), December 2025 (Gemini 3 Flash)

**Note:** Gemini 2.0 models will be deprecated on March 31, 2026.

### xAI (Grok)

**Latest Models (February 2026)**

| OpenAI Model | Grok Model | Features |
|-------------|------------|----------|
| gpt-4 | grok-2-1212 | Most capable, best reasoning |
| gpt-4-turbo | grok-2-1212 | Most capable, best reasoning |
| gpt-3.5-turbo | grok-2-mini-1212 | Faster, cost-effective |

**Alternative Models:**
- `grok-2-vision-1212` - Vision-enabled Grok 2
- `grok-vision-beta` - Beta vision model

**Key Features:**
- Real-time information access
- Vision support (image understanding)
- Truthful, insightful answers
- Strong reasoning capabilities
- Context window: 128K tokens

### Mistral AI

**Latest Models (February 2026)**

| OpenAI Model | Mistral Model | Context | Features |
|-------------|---------------|---------|----------|
| gpt-4 | mistral-large-latest | 128K tokens | Most capable, multilingual |
| gpt-4-turbo | mistral-large-latest | 128K tokens | Most capable, multilingual |
| gpt-3.5-turbo | mistral-small-latest | 32K tokens | Fast, cost-effective |

**Alternative Models:**
- `pixtral-large-latest` - Vision-enabled large model (124B params)
- `pixtral-12b-2409` - Efficient vision model (12B params)
- `mistral-medium-latest` - Balanced performance
- `codestral-latest` - Specialized for code generation

**Key Features:**
- Function calling support
- JSON mode
- Vision support (Pixtral models)
- Multilingual (100+ languages)
- Strong coding capabilities

**Pricing:**
- Large: €2/MTok input, €6/MTok output
- Small: €0.2/MTok input, €0.6/MTok output

### Cohere

**Latest Models (February 2026)**

| OpenAI Model | Cohere Model | Context | Features |
|-------------|--------------|---------|----------|
| gpt-4 | command-r-plus-08-2024 | 128K tokens | Most capable, RAG optimized |
| gpt-4-turbo | command-r-plus-08-2024 | 128K tokens | Most capable, RAG optimized |
| gpt-3.5-turbo | command-r-08-2024 | 128K tokens | Fast, efficient |

**Alternative Models:**
- `command-r-plus` - Latest version (alias)
- `command-r` - Latest version (alias)
- `command` - Legacy model
- `command-light` - Lightweight model

**Key Features:**
- RAG (Retrieval Augmented Generation) optimized
- Citation support
- Multilingual (10+ languages)
- Tool use / function calling
- Grounded generation

**Pricing:**
- Command R+: $2.50/MTok input, $10/MTok output
- Command R: $0.15/MTok input, $0.60/MTok output

### Perplexity

**Latest Models (February 2026)**

| OpenAI Model | Perplexity Model | Context | Features |
|-------------|------------------|---------|----------|
| gpt-4 | sonar-pro | 128K tokens | Most capable, online search |
| gpt-4-turbo | sonar | 128K tokens | Fast, online search |
| gpt-3.5-turbo | sonar-reasoning | 128K tokens | Reasoning-focused |

**Alternative Models:**
- `sonar-pro` - Best performance with online search
- `sonar` - Balanced performance with online search
- `sonar-reasoning` - Deep reasoning without search

**Key Features:**
- Real-time web search integration
- Up-to-date information
- Citation support
- Reasoning capabilities
- Based on Llama 3.1 architecture

**Pricing:**
- Sonar Pro: $3/MTok input, $15/MTok output
- Sonar: $1/MTok input, $5/MTok output
- Sonar Reasoning: $1/MTok input, $5/MTok output

## 🎯 Use Cases

### Development & Testing
- Test different AI providers without changing client code
- Compare responses from multiple models
- A/B testing for model selection
- Prototype with various AI capabilities

### Production Deployment
- Use multiple AI providers with OpenAI-compatible tools
- Integrate various AI models into existing OpenAI workflows
- Failover between providers for reliability
- Cost optimization by switching providers

### Integration Examples
- LangChain with any provider
- OpenAI Python/Node.js SDKs
- ChatGPT-compatible applications
- Custom AI applications

## 🏗️ Technical Architecture

### Stack
- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **Language:** TypeScript
- **HTTP Client:** Native fetch API
- **Logging:** Winston
- **Streaming:** Server-Sent Events (SSE)

### Project Structure
```
openai-compatible-proxy/
├── src/
│   ├── providers/          # Provider implementations
│   │   ├── claude-provider.ts
│   │   ├── gemini-provider.ts
│   │   ├── xai-provider.ts
│   │   ├── mistral-provider.ts
│   │   ├── cohere-provider.ts
│   │   ├── perplexity-provider.ts
│   │   └── factory.ts      # Provider factory
│   ├── routes/             # API routes
│   │   └── chat.ts
│   ├── utils/              # Utilities
│   │   ├── logger.ts       # Winston logger
│   │   └── error-handler.ts
│   ├── config.ts           # Configuration
│   └── server.ts           # Express server
├── logs/                   # Log files
├── .env.example            # Environment template
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker Compose
└── package.json
```

### Provider Implementation
Each provider implements a common interface:
```typescript
interface Provider {
  chat(messages: Message[], options: ChatOptions): Promise<Response>
  streamChat(messages: Message[], options: ChatOptions): AsyncGenerator<Chunk>
}
```

## 🛡️ Error Handling

The proxy provides comprehensive error handling:

### Provider-Specific Errors
- API key validation
- Rate limiting
- Model availability
- Context length exceeded
- Invalid requests

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (invalid API key)
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error
- `503` - Service Unavailable (provider down)

### Error Response Format
```json
{
  "error": {
    "message": "Detailed error message",
    "type": "invalid_request_error",
    "code": "invalid_api_key"
  }
}
```

## 📊 Logging

Logs are written to multiple destinations:

### Log Files
- `logs/error.log` - Errors only
- `logs/combined.log` - All logs
- Console output - All logs (development)

### Log Format
```
2026-02-06 12:00:00 [info]: Request received: POST /v1/chat/completions
2026-02-06 12:00:01 [info]: Using provider: claude
2026-02-06 12:00:02 [info]: Response sent: 200
```

### Log Levels
- `error` - Critical errors
- `warn` - Warnings and deprecations
- `info` - General information (default)
- `debug` - Detailed debugging

## 🔒 Security Best Practices

1. **API Keys:** Never commit API keys to version control
2. **Environment Variables:** Use `.env` file for sensitive data
3. **HTTPS:** Use HTTPS in production
4. **Rate Limiting:** Implement rate limiting for public deployments
5. **Input Validation:** All inputs are validated before processing
6. **Error Messages:** Sensitive information is not exposed in errors

## 🚀 Performance Optimization

- **Streaming:** Real-time responses with SSE
- **No SDK Dependencies:** Direct fetch-based implementation
- **Connection Pooling:** Efficient HTTP connections
- **Error Recovery:** Automatic retry logic
- **Logging:** Structured logging with minimal overhead

## 📝 API Compatibility

### Supported OpenAI API Features
- ✅ Chat completions
- ✅ Streaming responses
- ✅ System messages
- ✅ Multi-turn conversations
- ✅ Temperature control
- ✅ Max tokens
- ✅ Top-p sampling
- ✅ Vision (images)
- ✅ Usage statistics

### Not Yet Supported
- ❌ Function calling (coming soon)
- ❌ Embeddings
- ❌ Fine-tuning
- ❌ Assistants API
- ❌ Audio/TTS

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup
```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [Anthropic Claude API](https://docs.anthropic.com/)
- [OpenAI API](https://platform.openai.com/docs)
- [Google Gemini API](https://ai.google.dev/)
- [xAI API](https://docs.x.ai/)
- [Mistral AI API](https://docs.mistral.ai/)
- [Cohere API](https://docs.cohere.com/)
- [Perplexity API](https://docs.perplexity.ai/)

## 📞 Support

For issues, questions, or contributions:
- GitHub Issues: [Create an issue](https://github.com/amhunter1/openai-compatible-proxy/issues)
- Documentation: See this README
- Email: [Your contact email]

---

**Note:** This proxy is not officially affiliated with OpenAI, Anthropic, Google, xAI, Mistral AI, Cohere, or Perplexity. It is an independent project that provides compatibility between different AI provider APIs.

**Last Updated:** February 6, 2026
