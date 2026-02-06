# 🔄 OpenAI-Compatible Proxy

> **Use Claude (or any LLM) with OpenAI's API format. Zero code changes required.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

## 🎯 What is this?

A lightweight proxy server that translates OpenAI API requests to other LLM providers. Drop-in replacement for `api.openai.com` - no code changes needed.

**Perfect for:**
- 🔌 Using Claude in OpenAI-compatible tools
- 🔄 Switching between providers without refactoring
- 🧪 Testing different models with the same codebase
- 💰 Cost optimization by provider switching

## ✨ Why use it?

- **Zero Integration Work** - Works with any OpenAI SDK/library
- **Streaming Support** - Full SSE streaming for real-time responses
- **Provider Agnostic** - Switch providers via environment variable
- **Production Ready** - Docker support, error handling, validation
- **Type Safe** - Built with TypeScript

## 🚀 Supported Providers

| Provider | Status | Models |
|----------|--------|--------|
| **Claude** (Anthropic) | ✅ Default
| **OpenAI** | ✅ Pass-through

## 🐳 Quick Start (Docker)

```bash
# Clone the repository
git clone https://github.com/amhunter1/openai-compatible-proxy.git
cd openai-compatible-proxy

# Set your API keys
export ANTHROPIC_API_KEY=sk-ant-xxxxx
export OPENAI_API_KEY=sk-xxxxx

# Run with Docker Compose
docker-compose up -d
```

Server runs on `http://localhost:3000`

## 📦 Manual Installation

```bash
npm install
cp .env.example .env
# Edit .env with your API keys
npm run dev
```

## 💻 Usage

### Basic Request

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

### Streaming Request

```bash
curl http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Count to 10"}
    ],
    "stream": true
  }'
```

### With OpenAI SDK

```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'http://localhost:3000/v1',
  apiKey: 'not-needed', // Proxy handles auth
});

const response = await client.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

### Python Example

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:3000/v1",
    api_key="not-needed"
)

response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

## ⚙️ Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | Server port |
| `PROVIDER` | No | `claude` | Provider to use (`claude` or `openai`) |
| `ANTHROPIC_API_KEY` | Yes* | - | Anthropic API key |
| `OPENAI_API_KEY` | Yes* | - | OpenAI API key |

*Required based on selected provider

## 🎛️ Switching Providers

Change the `PROVIDER` environment variable:

```bash
# Use Claude (default)
PROVIDER=claude docker-compose up

# Use OpenAI
PROVIDER=openai docker-compose up
```

## 📡 API Endpoints

- `POST /v1/chat/completions` - Chat completions (streaming & non-streaming)
- `GET /v1/models` - List available models

## 🔧 Model Mapping

When using Claude provider:

| OpenAI Model | Maps to Claude Model |
|--------------|---------------------|
| `gpt-4` | `claude-3-5-sonnet-20241022` |
| `gpt-4-turbo` | `claude-3-5-sonnet-20241022` |
| `gpt-3.5-turbo` | `claude-3-5-haiku-20241022` |

## 🛡️ Error Handling

All errors are normalized to OpenAI's error format:

```json
{
  "error": {
    "message": "Invalid request",
    "type": "invalid_request_error"
  }
}
```

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Client    │─────▶│    Proxy     │─────▶│   Claude    │
│ (OpenAI SDK)│      │  (Adapter)   │      │     API     │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            └──────────────▶┌─────────────┐
                                            │   OpenAI    │
                                            │     API     │
                                            └─────────────┘
```

## 🚀 Production Deployment

### Docker

```bash
docker build -t openai-proxy .
docker run -p 3000:3000 \
  -e ANTHROPIC_API_KEY=sk-ant-xxxxx \
  -e PROVIDER=claude \
  openai-proxy
```

### Docker Compose

```bash
docker-compose up -d
```

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## ⭐ Star History

If this project helped you, please consider giving it a star! It helps others discover the project.
