# Resume AI Detector

A Next.js application that analyzes PDF resumes to determine the likelihood that they were created using AI tools.

## Features

- **PDF Upload**: Drag and drop or click to upload PDF resume files
- **AI Analysis**: Advanced text pattern analysis to detect AI-generated content
- **Percentage Score**: Clear percentage indicating AI probability
- **Modern UI**: Beautiful, responsive interface with Tailwind CSS
- **Real-time Feedback**: Instant analysis results with confidence indicators

## How It Works

The application uses pattern recognition to analyze resumes for:

### AI Indicators
- Generic, overused phrases ("results-driven professional", "proven track record")
- Repetitive sentence structures
- Overly formal language patterns
- Lack of specific personal details

### Human Indicators
- Specific personal achievements and dates
- Technical skills and tools mentioned
- Casual, conversational language
- Unique experiences and accomplishments

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:3000`

4. **Upload a PDF resume** and click "Analyze Resume" to get your AI probability score

## Technology Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **pdf-parse** - PDF text extraction
- **Lucide React** - Beautiful icons

## API Endpoints

### POST `/api/analyze`
Analyzes a PDF resume and returns AI probability score.

**Request**: FormData with PDF file
**Response**: 
```json
{
  "aiProbability": 75.3,
  "wordCount": 450,
  "textLength": 2847
}
```

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts      # API endpoint for analysis
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main application page
└── components/               # Reusable components (if any)
```

## Limitations

- Analysis is based on text patterns and may not be 100% accurate
- Results are for informational purposes only
- Works best with English-language resumes
- Requires PDF files with extractable text

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License