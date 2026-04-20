[![Project Demo](https://img.youtube.com/vi/YOUR_VIDEO_ID/0.jpg)](https://youtu.be/BNlOkdmHAe8)
[![Project Demo](https://img.youtube.com/vi/YOUR_VIDEO_ID/0.jpg)](https://youtu.be/HG-_jhD0smM)
[![Project Demo 1](https://img.youtube.com/vi/YOUR_VIDEO_ID/0.jpg)](https://youtu.be/q7TQWPLZdeM)

## Web Research Feature

The project now includes a separate web research flow alongside the existing SAP CAP documentation query flow.

### What It Does

- Takes a fresh user research query
- Optimizes the query with a Windows-hosted local LLM
- Uses Tavily Search API to find relevant pages
- Scrapes only the top 3 links
- Generates quick summaries with `qwen2.5:3b-instruct`

### Required Backend Configuration

Copy the values from `backend/.env.example` into your backend `.env` file and set:

- `TAVILY_API_KEY`
- `RESEARCH_OLLAMA_URL`
- `RESEARCH_OLLAMA_MODEL`
- `TAVILY_FREE_TIER_LIMIT`

For demo safety, the Tavily limiter defaults to `900` monthly requests so the app stays under the nominal free monthly credit envelope.
