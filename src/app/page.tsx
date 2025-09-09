'use client';

import { useState } from 'react';
import { Upload, FileText, Brain, AlertCircle, CheckCircle } from 'lucide-react';

interface AnalysisResult {
  aiProbability: number;
  isAnalyzing: boolean;
  error?: string;
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>({
    aiProbability: 0,
    isAnalyzing: false,
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setAnalysisResult({ aiProbability: 0, isAnalyzing: false });
    } else {
      alert('Please select a valid PDF file.');
    }
  };

  const analyzeResume = async () => {
    if (!selectedFile) return;

    setAnalysisResult({ aiProbability: 0, isAnalyzing: true });

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      setAnalysisResult({
        aiProbability: result.aiProbability,
        isAnalyzing: false,
      });
    } catch (error) {
      setAnalysisResult({
        aiProbability: 0,
        isAnalyzing: false,
        error: 'Failed to analyze resume. Please try again.',
      });
    }
  };

  const getResultColor = (probability: number) => {
    if (probability < 30) return 'text-green-600';
    if (probability < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getResultIcon = (probability: number) => {
    if (probability < 30) return <CheckCircle className="w-6 h-6 text-green-600" />;
    if (probability < 70) return <AlertCircle className="w-6 h-6 text-yellow-600" />;
    return <AlertCircle className="w-6 h-6 text-red-600" />;
  };

  const getResultMessage = (probability: number) => {
    if (probability < 30) return 'Likely human-written';
    if (probability < 70) return 'Uncertain - mixed signals';
    return 'Likely AI-generated';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white rounded-full shadow-lg">
              <Brain className="w-12 h-12 text-indigo-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Resume AI Detector
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your resume to analyze the likelihood that it was created using AI tools
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* File Upload Section */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Upload Resume (PDF only)
            </label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <span className="text-lg font-medium text-gray-600 mb-2">
                  {selectedFile ? selectedFile.name : 'Click to upload PDF'}
                </span>
                <span className="text-sm text-gray-500">
                  Maximum file size: 10MB
                </span>
              </label>
            </div>

            {selectedFile && (
              <div className="mt-4 flex items-center justify-center text-sm text-gray-600">
                <FileText className="w-4 h-4 mr-2" />
                {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>

          {/* Analyze Button */}
          <div className="text-center mb-8">
            <button
              onClick={analyzeResume}
              disabled={!selectedFile || analysisResult.isAnalyzing}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center mx-auto"
            >
              {analysisResult.isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5 mr-3" />
                  Analyze Resume
                </>
              )}
            </button>
          </div>

          {/* Results Section */}
          {analysisResult.aiProbability > 0 && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                Analysis Results
              </h3>
              
              <div className="text-center">
                <div className="mb-4">
                  {getResultIcon(analysisResult.aiProbability)}
                </div>
                
                <div className="mb-4">
                  <div className={`text-4xl font-bold ${getResultColor(analysisResult.aiProbability)}`}>
                    {analysisResult.aiProbability.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    AI Probability Score
                  </div>
                </div>

                <div className={`text-lg font-medium ${getResultColor(analysisResult.aiProbability)}`}>
                  {getResultMessage(analysisResult.aiProbability)}
                </div>

                <div className="mt-4 bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-2">Confidence Level:</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-1000 ${
                        analysisResult.aiProbability < 30
                          ? 'bg-green-500'
                          : analysisResult.aiProbability < 70
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${analysisResult.aiProbability}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {analysisResult.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-800">{analysisResult.error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            This tool analyzes text patterns and structure to estimate AI usage probability.
            Results are for informational purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}