import { NextRequest, NextResponse } from 'next/server';

// AI detection patterns and keywords
const AI_INDICATORS = {
  // Common AI-generated phrases
  phrases: [
    'results-driven professional',
    'proven track record',
    'excellent communication skills',
    'strong analytical skills',
    'detail-oriented',
    'team player',
    'self-motivated',
    'passionate about',
    'leverage my skills',
    'utilize my experience',
    'dynamic professional',
    'innovative solutions',
    'cutting-edge',
    'synergy',
    'paradigm shift',
    'best practices',
    'value-added',
    'core competencies',
    'strategic thinking',
    'cross-functional',
    'thought leadership',
    'game-changing',
    'disruptive innovation',
    'scalable solutions',
    'end-to-end',
    'holistic approach',
    'action-oriented',
    'results-oriented',
    'performance-driven',
    'customer-centric'
  ],
  
  // Overly formal or generic language patterns
  formalPatterns: [
    /I am a \w+ professional with \d+ years of experience/gi,
    /I have a proven track record of/gi,
    /I am passionate about/gi,
    /I am seeking a challenging position/gi,
    /I am a highly motivated/gi,
    /I possess strong/gi,
    /I am committed to/gi,
    /I am dedicated to/gi,
    /I am experienced in/gi,
    /I have extensive experience/gi
  ],
  
  // Repetitive sentence structures
  repetitivePatterns: [
    /I \w+ \w+ \w+ \w+ \w+/gi, // "I have strong analytical skills"
    /I am \w+ \w+ \w+ \w+/gi,  // "I am a results-driven professional"
    /I can \w+ \w+ \w+ \w+/gi, // "I can provide excellent service"
  ]
};

const HUMAN_INDICATORS = {
  // Personal, specific details
  personalDetails: [
    /I graduated from \w+ University in \d{4}/gi,
    /I worked at \w+ from \d{4} to \d{4}/gi,
    /I led a team of \d+ people/gi,
    /I increased sales by \d+%/gi,
    /I reduced costs by \$\d+/gi,
    /I managed a budget of \$\d+/gi,
    /I completed \d+ projects/gi,
    /I received the \w+ award/gi,
    /I was promoted to \w+/gi,
    /I relocated to \w+/gi
  ],
  
  // Specific technical skills
  technicalSkills: [
    /JavaScript|Python|Java|C\+\+|React|Angular|Vue|Node\.js|SQL|MongoDB|AWS|Azure|Docker|Kubernetes/gi,
    /Photoshop|Illustrator|Figma|Sketch|InDesign/gi,
    /Excel|PowerBI|Tableau|Salesforce|HubSpot/gi
  ],
  
  // Casual or conversational language
  casualLanguage: [
    /I love/gi,
    /I enjoy/gi,
    /I'm excited about/gi,
    /I'm looking forward to/gi,
    /I've always been/gi,
    /I started/gi,
    /I began/gi,
    /I decided to/gi
  ]
};

function calculateAIProbability(text: string): number {
  let aiScore = 0;
  let humanScore = 0;
  
  // Convert to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase();
  
  // Check for AI indicators
  AI_INDICATORS.phrases.forEach(phrase => {
    const matches = (lowerText.match(new RegExp(phrase, 'g')) || []).length;
    aiScore += matches * 2; // Weight phrases heavily
  });
  
  AI_INDICATORS.formalPatterns.forEach(pattern => {
    const matches = (text.match(pattern) || []).length;
    aiScore += matches * 1.5;
  });
  
  AI_INDICATORS.repetitivePatterns.forEach(pattern => {
    const matches = (text.match(pattern) || []).length;
    aiScore += matches * 1;
  });
  
  // Check for human indicators
  HUMAN_INDICATORS.personalDetails.forEach(pattern => {
    const matches = (text.match(pattern) || []).length;
    humanScore += matches * 3; // Weight personal details heavily
  });
  
  HUMAN_INDICATORS.technicalSkills.forEach(pattern => {
    const matches = (text.match(pattern) || []).length;
    humanScore += matches * 2;
  });
  
  HUMAN_INDICATORS.casualLanguage.forEach(pattern => {
    const matches = (text.match(pattern) || []).length;
    humanScore += matches * 1.5;
  });
  
  // Calculate text length factor (shorter resumes might be more AI-like)
  const wordCount = text.split(/\s+/).length;
  const lengthFactor = wordCount < 200 ? 0.1 : wordCount < 500 ? 0.05 : 0;
  
  // Calculate final probability
  const totalScore = aiScore + humanScore;
  if (totalScore === 0) return 50; // Default to uncertain if no indicators found
  
  const aiProbability = Math.min(95, Math.max(5, (aiScore / totalScore) * 100 + lengthFactor * 100));
  
  return Math.round(aiProbability * 10) / 10; // Round to 1 decimal place
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      );
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }
    
    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    
    // For now, we'll use a simple approach that works with basic PDFs
    // This extracts text from PDFs that have embedded text (not scanned images)
    const uint8Array = new Uint8Array(buffer);
    const bufferString = Buffer.from(uint8Array).toString('binary');
    
    // Simple PDF text extraction - looks for text between BT and ET markers
    const textMatches = bufferString.match(/BT[\s\S]*?ET/g);
    let text = '';
    
    if (textMatches) {
      text = textMatches
        .map(match => {
          // Extract text content from PDF text objects
          const textContent = match.match(/\(([^)]+)\)/g);
          if (textContent) {
            return textContent
              .map(tc => tc.slice(1, -1)) // Remove parentheses
              .join(' ');
          }
          return '';
        })
        .filter(t => t.trim().length > 0)
        .join(' ');
    }
    
    // If no text found with the simple method, try a more basic approach
    if (!text || text.trim().length === 0) {
      // Look for any readable text in the PDF
      const readableText = bufferString
        .replace(/[^\x20-\x7E\n\r]/g, ' ') // Keep only printable ASCII and newlines
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      // Extract potential text content (basic heuristic)
      const words = readableText.split(' ').filter(word => 
        word.length > 2 && 
        /^[a-zA-Z]+$/.test(word) // Only alphabetic words
      );
      
      if (words.length > 10) { // If we found enough words, use it
        text = words.join(' ');
      }
    }
    
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Could not extract text from PDF' },
        { status: 400 }
      );
    }
    
    // Analyze the text
    const aiProbability = calculateAIProbability(text);
    
    return NextResponse.json({
      aiProbability,
      wordCount: text.split(/\s+/).length,
      textLength: text.length
    });
    
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze resume' },
      { status: 500 }
    );
  }
}
