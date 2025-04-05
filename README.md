# DOI-to-PDF API

A robust API for retrieving, extracting, and processing academic papers using Digital Object Identifiers (DOIs).

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9%2B-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)
[![AWS Lambda](https://img.shields.io/badge/AWS%20Lambda-Ready-orange)](https://aws.amazon.com/lambda/)

## Features

- 📄 **PDF Retrieval**: Download academic papers using DOI identifiers
- 📝 **Text Extraction**: Convert PDFs to plain text
- 📋 **Structured Content**: Extract content with page-by-page structure
- 📊 **Metadata**: Fetch paper metadata (title, authors, journal, etc.)
- 🚀 **High Performance**: Built-in caching and rate limiting
- ☁️ **Serverless Ready**: Optimized for AWS Lambda deployment
- 🔍 **Full Content Search**: Search within paper content

## API Endpoints

| Endpoint                        | Description            | Example                                           |
| ------------------------------- | ---------------------- | ------------------------------------------------- |
| `/api/paper?doi={DOI}`          | Get full PDF document  | `/api/paper?doi=10.1145/3025453.3025501`          |
| `/api/paper/text?doi={DOI}`     | Extract plain text     | `/api/paper/text?doi=10.1145/3025453.3025501`     |
| `/api/paper/content?doi={DOI}`  | Get structured content | `/api/paper/content?doi=10.1145/3025453.3025501`  |
| `/api/paper/metadata?doi={DOI}` | Get paper metadata     | `/api/paper/metadata?doi=10.1145/3025453.3025501` |
| `/api/paper/complete?doi={DOI}` | Get metadata and text  | `/api/paper/complete?doi=10.1145/3025453.3025501` |
| `/api/health`                   | API health check       | `/api/health`                                     |
| `/api/paper/test`               | Show usage examples    | `/api/paper/test`                                 |

## Installation

### Prerequisites

- Node.js 16.x or higher
- npm or yarn
- AWS CLI (for deployment)
- Serverless Framework (for deployment)

### Local Development Setup

1. Clone the repository:

```bash
git clone https://github.com/mark-abraham-dev/doi-to-pdf-api.git
cd doi-to-pdf-api
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project root:

```
NODE_ENV=development
PORT=3000
CACHE_ENABLED=true
CACHE_TTL=86400
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10
TEXT_EXTRACTION_ENABLED=true
```

4. Start the development server:

```bash
npm run dev
```

5. Access the API at http://localhost:3000/api/health

## Usage Examples

### Getting a PDF

```bash
# Using curl
curl -o paper.pdf "http://localhost:3000/api/paper?doi=10.1145/3025453.3025501"

# Using wget
wget -O paper.pdf "http://localhost:3000/api/paper?doi=10.1145/3025453.3025501"
```

### Extracting Text from a Paper

```bash
curl "http://localhost:3000/api/paper/text?doi=10.1145/3025453.3025501"
```

Response:

```json
{
  "text": "Investigating Haptic Perception of and Physiological Responses to Air Vortex Rings on a User's Cheek...",
  "numPages": 10,
  "title": "Investigating Haptic Perception of and Physiological Responses to Air Vortex Rings on a User's Cheek"
}
```

### Getting Complete Paper Information

```bash
curl "http://localhost:3000/api/paper/complete?doi=10.1145/3025453.3025501"
```

Response:

```json
{
  "metadata": {
    "doi": "10.1145/3025453.3025501",
    "title": "Investigating Haptic Perception of and Physiological Responses to Air Vortex Rings on a User's Cheek",
    "authors": "Yuki Sato, Ryoko Ueoka",
    "publishedDate": "2017-05-02T00:00:00.000Z",
    "journal": "Proceedings of the 2017 CHI Conference on Human Factors in Computing Systems",
    "abstract": "..."
  },
  "content": {
    "text": "...",
    "numPages": 10
  }
}
```

## Deployment

### Deploying to AWS Lambda

1. Configure AWS credentials:

```bash
aws configure
# OR
serverless config credentials --provider aws --key YOUR_ACCESS_KEY --secret YOUR_SECRET_KEY
```

2. Deploy to AWS:

```bash
# To the development environment
npm run deploy:dev

# To the production environment
npm run deploy:prod
```

3. After successful deployment, you'll get API Gateway endpoints:

```
endpoints:
  GET - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/api/health
  GET - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/api/paper
  GET - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/api/paper/text
  ...
```

### Checking Logs

```bash
# View development logs
npm run logs:dev

# View production logs
npm run logs:prod
```

## Performance Optimization

1. **Caching**:

   - API responses are cached for 24 hours by default
   - PDF content and extracted text are cached separately
   - Configure caching TTL in environment variables

2. **Rate Limiting**:

   - Default: 10 requests per minute per IP
   - Adjust with `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX_REQUESTS` env vars

3. **Lambda Optimization**:
   - Memory: 1024 MB recommended for faster PDF processing
   - Timeout: 60 seconds for handling large documents
   - Cold start: Minimized by optimized package size

## Project Structure

```
doi-pdf-api/
├── serverless.yml           # Serverless Framework configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Project dependencies
├── src/
│   ├── app.ts               # Express application
│   ├── lambda.ts            # Lambda handler
│   ├── controllers/         # API route handlers
│   ├── services/            # Business logic
│   ├── utils/               # Utility functions
│   ├── config/              # Configuration
│   ├── models/              # Data models
│   └── middleware/          # Express middleware
└── tests/                   # Tests
```

## Environment Variables

| Variable                  | Description                          | Default       |
| ------------------------- | ------------------------------------ | ------------- |
| `NODE_ENV`                | Environment (development/production) | `development` |
| `PORT`                    | Local development port               | `3000`        |
| `CACHE_ENABLED`           | Enable response caching              | `true`        |
| `CACHE_TTL`               | Cache TTL in seconds                 | `86400` (24h) |
| `RATE_LIMIT_WINDOW_MS`    | Rate limit window in ms              | `60000` (1m)  |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window              | `10`          |
| `TEXT_EXTRACTION_ENABLED` | Enable PDF text extraction           | `true`        |

## Best Practices

### Rate Limiting

The API implements rate limiting to prevent abuse. In production, consider implementing additional protection:

- API keys for authenticated access
- AWS API Gateway usage plans
- IP-based restrictions

### Caching Strategy

The application uses a multi-level caching strategy:

1. **In-memory cache**: For quick responses and reducing duplicate processing
2. **HTTP caching**: Cache-Control headers for client-side caching
3. **Lambda optimization**: Warm Lambda instances maintain in-memory cache

### Error Handling

All endpoints implement proper error handling:

- Standardized error responses
- Detailed logging for troubleshooting
- Rate limit errors (429) vs. server errors (5xx)

### Security Considerations

When deploying to production:

1. Consider adding authentication (API Gateway authorizers)
2. Implement CORS properly for browser clients
3. Set up WAF rules to protect against common attacks
4. Monitor for unusual patterns with CloudWatch

## Available Scripts

- `npm start`: Run in development mode
- `npm run dev`: Run with hot-reload
- `npm run build`: Build for production
- `npm test`: Run tests
- `npm run serverless:offline`: Test serverless locally
- `npm run deploy:dev`: Deploy to dev environment
- `npm run deploy:prod`: Deploy to production
- `npm run logs:dev`: View dev logs
- `npm run logs:prod`: View production logs

## Legal Considerations

This API provides access to academic papers which may be subject to copyright protections. Users should:

1. Only use this API for papers they have legitimate access to
2. Consider focusing on open access content
3. Respect publisher policies and terms of service

## Troubleshooting

### "Cannot connect to the server"

- Check if the server is running: `npm start`
- Verify the port is not in use by another application

### "PDF not found" errors

- Verify the DOI is correct
- Check if the source website is blocking your requests
- Try a different DOI to test the service

### Deployment failures

- Check AWS credentials and permissions
- Verify region settings
- Check Lambda service quotas and limits

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Express.js](https://expressjs.com/)
- [Serverless Framework](https://www.serverless.com/)
- [pdf-parse](https://www.npmjs.com/package/pdf-parse)
- [pdf.js-extract](https://www.npmjs.com/package/pdf.js-extract)

---

Built with ❤️ for academic research
