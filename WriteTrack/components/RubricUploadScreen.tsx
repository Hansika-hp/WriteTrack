import { useState, useRef } from 'react';
import { Upload, Sparkles, BookCheck, CheckCircle2, FileEdit, Zap, ImageIcon, FileText, Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import { RubricRequirement } from '../App';
import asuLogo from 'figma:asset/f7834cce9543f40044f768d8f9ee2584d868eb14.png';

interface RubricUploadScreenProps {
  onUpload: (requirements: RubricRequirement[]) => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export function RubricUploadScreen({ onUpload, darkMode, setDarkMode }: RubricUploadScreenProps) {
  const [rubricText, setRubricText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'text' | 'image'>('text');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse rubric and extract requirements
  const parseRubric = (text: string): RubricRequirement[] => {
    const requirements: RubricRequirement[] = [];
    
    // Keywords to look for in rubric
    const thesisKeywords = ['thesis', 'argument', 'claim', 'main point', 'position'];
    const citationKeywords = ['citation', 'reference', 'source', 'works cited', 'bibliography'];
    const organizationKeywords = ['organization', 'structure', 'word count', 'length', 'paragraphs'];
    const mechanicsKeywords = ['grammar', 'spelling', 'mechanics', 'punctuation', 'clarity'];
    
    const lowerText = text.toLowerCase();
    
    // Check for thesis requirement
    if (thesisKeywords.some(keyword => lowerText.includes(keyword))) {
      requirements.push({
        id: 'thesis',
        title: 'Clear Thesis Statement',
        description: 'Make sure your essay includes a clear, specific thesis',
        asuLink: 'https://inscribe.education/main/asu/6754110229502419/general/compositions/6749461749793482?topicSlug=thesis-formatting&contentType=composition&contentId=6749461749793482&backToListTab=all',
        checkFunction: (content, analysis) => analysis.hasThesis || analysis.wordCount >= 150
      });
    }
    
    // Check for organization/word count requirement
    if (organizationKeywords.some(keyword => lowerText.includes(keyword))) {
      requirements.push({
        id: 'organization',
        title: 'Word Count / Organization',
        description: 'Ensure the essay meets length and organization requirements',
        asuLink: 'https://inscribe.education/main/asu/6754110229502419/general/compositions/6749461749925860?topicSlug=organization&contentType=composition&contentId=6749461749925860&backToListTab=all',
        checkFunction: (content, analysis) => analysis.wordCount >= 500
      });
    }
    
    // Check for citation requirement
    if (citationKeywords.some(keyword => lowerText.includes(keyword))) {
      requirements.push({
        id: 'citations',
        title: 'Academic Citations (3+ Sources)',
        description: 'Include at least three properly formatted scholarly citations',
        asuLink: 'https://inscribe.education/main/asu/6754110229502419/general/compositions/6749461750624329?topicSlug=citation&contentType=composition&contentId=6749461750624329&backToListTab=all',
        checkFunction: (content, analysis) => analysis.citationCount >= 3
      });
    }
    
    // Check for mechanics requirement
    if (mechanicsKeywords.some(keyword => lowerText.includes(keyword))) {
      requirements.push({
        id: 'mechanics',
        title: 'Revision / Writing Mechanics',
        description: 'Revise for grammar, clarity, and tone',
        asuLink: 'https://inscribe.education/main/asu/6754110229502419/general/compositions/6749461750596717?topicSlug=writing-mechanics&contentType=composition&contentId=6749461750596717&backToListTab=all',
        checkFunction: (content, analysis) => analysis.hasGoodMechanics || analysis.wordCount >= 400
      });
    }
    
    // If no requirements found, add default set
    if (requirements.length === 0) {
      return [
        {
          id: 'thesis',
          title: 'Clear Thesis Statement',
          description: 'Make sure your essay includes a clear, specific thesis',
          asuLink: 'https://inscribe.education/main/asu/6754110229502419/general/compositions/6749461749793482?topicSlug=thesis-formatting&contentType=composition&contentId=6749461749793482&backToListTab=all',
          checkFunction: (content, analysis) => analysis.hasThesis || analysis.wordCount >= 150
        },
        {
          id: 'organization',
          title: 'Word Count / Organization',
          description: 'Ensure the essay meets length and organization requirements',
          asuLink: 'https://inscribe.education/main/asu/6754110229502419/general/compositions/6749461749925860?topicSlug=organization&contentType=composition&contentId=6749461749925860&backToListTab=all',
          checkFunction: (content, analysis) => analysis.wordCount >= 500
        },
        {
          id: 'citations',
          title: 'Academic Citations (3+ Sources)',
          description: 'Include at least three properly formatted scholarly citations',
          asuLink: 'https://inscribe.education/main/asu/6754110229502419/general/compositions/6749461750624329?topicSlug=citation&contentType=composition&contentId=6749461750624329&backToListTab=all',
          checkFunction: (content, analysis) => analysis.citationCount >= 3
        },
        {
          id: 'mechanics',
          title: 'Revision / Writing Mechanics',
          description: 'Revise for grammar, clarity, and tone',
          asuLink: 'https://inscribe.education/main/asu/6754110229502419/general/compositions/6749461750596717?topicSlug=writing-mechanics&contentType=composition&contentId=6749461750596717&backToListTab=all',
          checkFunction: (content, analysis) => analysis.hasGoodMechanics || analysis.wordCount >= 400
        }
      ];
    }
    
    return requirements;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        // Simulate OCR text extraction
        const simulatedOCRText = `Assignment Rubric
        
1. Clear Thesis Statement (20 points)
   - Essay must include a clear, arguable thesis statement
   - Thesis should be in the introduction paragraph
   
2. Organization and Length (20 points)
   - Minimum 500 words
   - Well-organized with clear paragraphs
   - Logical flow of ideas
   
3. Citations (30 points)
   - At least 3 scholarly sources
   - Proper citation format (APA/MLA)
   - Works cited page included
   
4. Writing Mechanics (30 points)
   - Grammar and spelling
   - Proper punctuation
   - Clear and concise language`;
        
        setRubricText(simulatedOCRText);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    
    // Simulate analysis delay
    setTimeout(() => {
      const requirements = parseRubric(rubricText);
      onUpload(requirements);
      setIsAnalyzing(false);
      // Scroll to top when transitioning to the writing interface
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1500);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-[#8C1D40]/5 via-white to-[#FFC627]/10'}`}>
      {/* Header Section */}
      <div className={`bg-gradient-to-r from-[#8C1D40] to-[#8C1D40]/90 border-b-4 border-[#FFC627] shadow-lg`}>
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={asuLogo} alt="ASU Logo" className="w-12 h-12" />
              <div>
                <h1 className="text-2xl text-white">WriteTrack</h1>
                <p className="text-sm text-[#FFC627]">AI-Powered Writing Assistant with ASU Resources</p>
              </div>
            </div>
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-3 rounded-lg bg-[#FFC627]/20 hover:bg-[#FFC627]/30 transition-colors"
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-[#FFC627]" />
              ) : (
                <Moon className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Upload Section */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Main Upload Card */}
        <Card className={`rounded-xl shadow-xl border-2 border-[#8C1D40]/20 p-8 max-w-3xl mx-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#8C1D40] to-[#8C1D40]/80 rounded-2xl mb-4 shadow-lg">
              <Sparkles className="w-8 h-8 text-[#FFC627]" />
            </div>
            <h2 className={`text-xl mb-2 ${darkMode ? 'text-white' : 'text-[#202124]'}`}>Step 1: Upload Your Assignment Rubric</h2>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-[#5f6368]'}`}>Choose text or image upload - we'll analyze it to create a personalized checklist</p>
          </div>

          {/* Upload Method Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setUploadMethod('text')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm transition-all ${
                uploadMethod === 'text'
                  ? 'bg-[#8C1D40] text-white shadow-md'
                  : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-[#5f6368] hover:bg-gray-200'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Paste Text
            </button>
            <button
              onClick={() => setUploadMethod('image')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm transition-all ${
                uploadMethod === 'image'
                  ? 'bg-[#8C1D40] text-white shadow-md'
                  : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-[#5f6368] hover:bg-gray-200'
              }`}
            >
              <ImageIcon className="w-4 h-4 inline mr-2" />
              Upload Screenshot
            </button>
          </div>

          {/* Upload Section */}
          <div className="space-y-4">
            {uploadMethod === 'text' ? (
              <div>
                <label className={`text-sm block mb-2 ${darkMode ? 'text-gray-200' : 'text-[#202124]'}`}>
                  Assignment Rubric
                </label>
                <Textarea
                  placeholder="Paste your assignment rubric here...

Example:
- Clear thesis statement (20 points)
- At least 500 words (20 points)  
- Minimum 3 scholarly citations (30 points)
- Proper grammar and formatting (30 points)"
                  value={rubricText}
                  onChange={(e) => setRubricText(e.target.value)}
                  className={`min-h-[200px] text-sm border-2 focus:border-[#8C1D40] transition-colors ${darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
                />
              </div>
            ) : (
              <div>
                <label className={`text-sm block mb-2 ${darkMode ? 'text-gray-200' : 'text-[#202124]'}`}>
                  Upload Rubric Screenshot
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed border-[#8C1D40]/30 rounded-xl p-8 text-center cursor-pointer hover:border-[#8C1D40] transition-all ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-[#8C1D40]/5'}`}
                >
                  {uploadedImage ? (
                    <div className="space-y-4">
                      <img
                        src={uploadedImage}
                        alt="Uploaded rubric"
                        className="max-h-[300px] mx-auto rounded-lg shadow-md"
                      />
                      <p className="text-sm text-[#34A853]">✓ Image uploaded successfully</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedImage(null);
                          setRubricText('');
                        }}
                        className="border-[#8C1D40] text-[#8C1D40] hover:bg-[#8C1D40] hover:text-white"
                      >
                        Remove & Upload New
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-[#8C1D40]/10 rounded-xl flex items-center justify-center mx-auto">
                        <ImageIcon className="w-8 h-8 text-[#8C1D40]" />
                      </div>
                      <div>
                        <p className="text-sm text-[#202124] mb-1">Click to upload rubric screenshot</p>
                        <p className="text-xs text-[#5f6368]">PNG, JPG, or PDF (Max 10MB)</p>
                      </div>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            )}

            {/* Action Button */}
            <Button
              onClick={handleAnalyze}
              disabled={!rubricText.trim() || isAnalyzing}
              className="w-full bg-gradient-to-r from-[#8C1D40] to-[#8C1D40]/80 hover:from-[#8C1D40]/90 hover:to-[#8C1D40]/70 text-white rounded-full h-12 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing Your Rubric...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Analyze Rubric & Start Writing
                </>
              )}
            </Button>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#8C1D40]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-[#8C1D40]" />
                </div>
                <div>
                  <h3 className={`text-sm mb-1 ${darkMode ? 'text-white' : 'text-[#202124]'}`}>Smart Detection</h3>
                  <p className={`text-xs text-left ${darkMode ? 'text-gray-300' : 'text-[#5f6368]'}`}>Automatically identifies thesis, citations, word count, and more</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#FFC627]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-[#8C1D40]" />
                </div>
                <div>
                  <h3 className={`text-sm mb-1 ${darkMode ? 'text-white' : 'text-[#202124]'}`}>Real-Time Updates</h3>
                  <p className={`text-xs text-left ${darkMode ? 'text-gray-300' : 'text-[#5f6368]'}`}>See your progress update instantly as you type</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#8C1D40]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookCheck className="w-4 h-4 text-[#8C1D40]" />
                </div>
                <div>
                  <h3 className={`text-sm mb-1 ${darkMode ? 'text-white' : 'text-[#202124]'}`}>ASU Resources</h3>
                  <p className={`text-xs text-left ${darkMode ? 'text-gray-300' : 'text-[#5f6368]'}`}>Direct links to official ASU writing guides for each requirement</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#FFC627]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-[#8C1D40]" />
                </div>
                <div>
                  <h3 className={`text-sm mb-1 ${darkMode ? 'text-white' : 'text-[#202124]'}`}>AI Suggestions</h3>
                  <p className={`text-xs text-left ${darkMode ? 'text-gray-300' : 'text-[#5f6368]'}`}>Get intelligent tips to improve your writing</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* ASU Branding Footer */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#8C1D40]/10 to-[#FFC627]/10 border border-[#8C1D40]/20 rounded-full px-6 py-3">
            <div className="w-6 h-6 bg-[#8C1D40] rounded-full flex items-center justify-center">
              <BookCheck className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm text-[#202124]">Powered by ASU Inscribe</span>
            <span className="text-xs text-[#5f6368]">• Official ASU Writing Resources</span>
          </div>
        </div>
      </div>
    </div>
  );
}
