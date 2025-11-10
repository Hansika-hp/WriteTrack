import { Settings, BookCheck, Check, Clock, X, Brain, RefreshCw, ExternalLink, ArrowRight, RotateCcw, Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { RubricRequirement } from '../App';

interface Analysis {
  wordCount: number;
  hasThesis: boolean;
  citationCount: number;
  hasIntroduction: boolean;
  hasConclusion: boolean;
  hasOrganization: boolean;
  hasGoodMechanics: boolean;
}

interface WriteTrackSidebarProps {
  requirements: RubricRequirement[];
  checkedItems: Record<string, boolean>;
  analysis: Analysis;
  onReset: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export function WriteTrackSidebar({ requirements, checkedItems, analysis, onReset, darkMode, setDarkMode }: WriteTrackSidebarProps) {
  // Calculate progress
  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalCount = requirements.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Determine status for a requirement
  const getRequirementStatus = (req: RubricRequirement) => {
    const isComplete = checkedItems[req.id];
    
    if (isComplete) {
      return { badge: 'Done', color: 'green', icon: Check };
    }
    
    // Determine if in progress based on requirement type
    if (req.id === 'thesis' && analysis.wordCount > 50) {
      return { badge: 'In Progress', color: 'blue', icon: Clock };
    }
    if (req.id === 'organization' && analysis.wordCount > 200 && analysis.wordCount < 500) {
      return { badge: 'In Progress', color: 'blue', icon: Clock };
    }
    if (req.id === 'citations' && analysis.citationCount > 0) {
      return { badge: 'In Progress', color: 'blue', icon: Clock };
    }
    if (req.id === 'mechanics' && analysis.hasGoodMechanics && analysis.wordCount >= 100) {
      return { badge: 'In Progress', color: 'yellow', icon: Clock };
    }
    
    return { badge: 'Needs Work', color: 'red', icon: X };
  };

  const getRequirementDescription = (req: RubricRequirement) => {
    const isComplete = checkedItems[req.id];
    
    if (req.id === 'thesis') {
      if (isComplete) return '✓ Thesis statement detected in introduction';
      if (analysis.wordCount > 50) return 'Keep writing to develop your thesis';
      return req.description;
    }
    
    if (req.id === 'organization') {
      if (isComplete) return `✓ Well organized with ${analysis.wordCount} words`;
      return `Current: ${analysis.wordCount} words (target: 500+)`;
    }
    
    if (req.id === 'citations') {
      if (isComplete) return `✓ Found ${analysis.citationCount} citations`;
      if (analysis.citationCount > 0) return `Found ${analysis.citationCount} citation${analysis.citationCount !== 1 ? 's' : ''} (need ${3 - analysis.citationCount} more)`;
      return req.description;
    }
    
    if (req.id === 'mechanics') {
      if (isComplete) return '✓ Writing mechanics look good';
      if (analysis.wordCount >= 100) return 'Review for grammar, clarity, and tone';
      return 'Keep writing to assess mechanics';
    }
    
    return req.description;
  };

  return (
    <div className={`w-[360px] border-l-4 border-[#8C1D40] flex flex-col shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      {/* Header */}
      <div className={`p-6 border-b-2 border-[#FFC627]/30 ${darkMode ? 'bg-gradient-to-r from-gray-900 to-gray-800' : 'bg-gradient-to-r from-[#8C1D40]/5 to-white'}`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#8C1D40] rounded-lg flex items-center justify-center">
              <BookCheck className="w-5 h-5 text-[#FFC627]" />
            </div>
            <div>
              <h2 className="text-[#8C1D40]">WriteTrack</h2>
              <p className={`text-xs text-left ${darkMode ? 'text-gray-400' : 'text-[#5f6368]'}`}>Real-time feedback aligned with ASU Writing Rubrics</p>
            </div>
          </div>
          <div className="flex gap-1">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              title="Toggle theme"
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-[#FFC627]" />
              ) : (
                <Moon className="w-4 h-4 text-[#5f6368]" />
              )}
            </button>
            <button 
              onClick={onReset}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              title="Upload new rubric"
            >
              <RotateCcw className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-[#5f6368]'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Real-time Status Alert */}
        <div className={`border border-[#8C1D40]/30 rounded-xl p-3 ${darkMode ? 'bg-gray-900/50' : 'bg-[#8C1D40]/10'}`}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#8C1D40] rounded-full animate-pulse" />
            <p className={`text-xs ${darkMode ? 'text-white' : 'text-[#202124]'}`}>Live Analysis Active</p>
          </div>
          <p className={`text-xs mt-1 text-left ${darkMode ? 'text-gray-400' : 'text-[#5f6368]'}`}>
            {analysis.wordCount} words • {analysis.citationCount} citation{analysis.citationCount !== 1 ? 's' : ''} detected
          </p>
        </div>

        {/* Assignment Requirements Section */}
        <div>
          <h3 className={`text-sm mb-3 ${darkMode ? 'text-[#FFC627]' : 'text-[#8C1D40]'}`}>Assignment Requirements ({requirements.length})</h3>
          <div className="space-y-3">
            {requirements.map((req) => {
              const status = getRequirementStatus(req);
              const description = getRequirementDescription(req);
              const isComplete = checkedItems[req.id];
              
              return (
                <Card 
                  key={req.id}
                  className={`rounded-xl border shadow-sm overflow-hidden ${
                    status.color === 'green' ? (darkMode ? 'border-green-700 bg-green-900/30' : 'border-green-200 bg-green-50') :
                    status.color === 'blue' ? (darkMode ? 'border-[#8C1D40]/50 bg-[#8C1D40]/10' : 'border-[#8C1D40]/30 bg-[#8C1D40]/5') :
                    status.color === 'yellow' ? (darkMode ? 'border-[#FFC627]/50 bg-[#FFC627]/10' : 'border-[#FFC627]/50 bg-[#FFC627]/10') :
                    darkMode ? 'border-red-700 bg-red-900/30' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <Checkbox 
                        id={req.id}
                        checked={isComplete}
                        disabled
                        className="mt-0.5" 
                      />
                      <div className="flex-1 min-w-0">
                        <label htmlFor={req.id} className={`text-sm block mb-1 text-left ${darkMode ? 'text-white' : 'text-[#202124]'}`}>
                          {req.title}
                        </label>
                        <p className={`text-xs text-left ${darkMode ? 'text-gray-400' : 'text-[#5f6368]'}`}>{description}</p>
                        {req.id === 'organization' && !isComplete && (
                          <Progress 
                            value={Math.min((analysis.wordCount / 500) * 100, 100)} 
                            className="h-1.5 mt-2" 
                          />
                        )}
                      </div>
                      <Badge className={`${
                        status.color === 'green' ? 'bg-[#34A853] hover:bg-[#34A853]' :
                        status.color === 'blue' ? 'bg-[#8C1D40] hover:bg-[#8C1D40]' :
                        status.color === 'yellow' ? 'bg-[#FFC627] text-[#8C1D40] hover:bg-[#FFC627]' :
                        'bg-red-600 hover:bg-red-600'
                      } ${status.color === 'yellow' ? 'text-[#8C1D40]' : 'text-white'} border-0 text-xs shrink-0`}>
                        <status.icon className="w-3 h-3 mr-1" />
                        {status.badge}
                      </Badge>
                    </div>
                    <a 
                      href={req.asuLink}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={`w-full rounded-full text-xs h-8 ${
                          status.color === 'green' ? 'border-green-300 hover:bg-green-100 hover:border-green-400' :
                          status.color === 'blue' ? 'border-[#8C1D40] text-[#8C1D40] hover:bg-[#8C1D40]/10 hover:border-[#8C1D40]' :
                          status.color === 'yellow' ? 'border-[#FFC627] text-[#8C1D40] hover:bg-[#FFC627]/20 hover:border-[#FFC627]' :
                          'border-red-300 hover:bg-red-100 hover:border-red-400'
                        }`}
                      >
                        View ASU Resource
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </a>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Progress Tracker */}
        <Card className={`p-4 rounded-xl border-2 border-[#8C1D40]/20 shadow-sm ${darkMode ? 'bg-gradient-to-r from-gray-900 to-gray-800' : 'bg-gradient-to-r from-[#8C1D40]/10 to-[#FFC627]/20'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm ${darkMode ? 'text-[#FFC627]' : 'text-[#8C1D40]'}`}>Overall Progress</span>
            <span className={`text-xs ${darkMode ? 'text-[#FFC627]' : 'text-[#8C1D40]'}`}>{completedCount} of {totalCount} complete — {Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2.5 mb-3" />
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalCount }).map((_, i) => (
              i < completedCount ? (
                <div key={i} className="w-6 h-6 rounded-full bg-[#34A853] flex items-center justify-center transition-all duration-300">
                  <Check className="w-4 h-4 text-white" />
                </div>
              ) : (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-[#8C1D40]/30 bg-white" />
              )
            ))}
          </div>
        </Card>

        {/* AI Feedback Cards */}
        {!analysis.hasConclusion && analysis.wordCount > 200 && (
          <Card className={`border border-[#FFC627]/50 p-4 rounded-xl shadow-sm ${darkMode ? 'bg-[#FFC627]/5' : 'bg-[#FFC627]/10'}`}>
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-[#8C1D40]/10 rounded-full flex items-center justify-center flex-shrink-0 text-lg">
                🤖
              </div>
              <div className="flex-1">
                <h4 className={`text-sm mb-1 text-left ${darkMode ? 'text-[#FFC627]' : 'text-[#8C1D40]'}`}>AI Suggestion</h4>
                <p className={`text-xs text-left ${darkMode ? 'text-gray-400' : 'text-[#5f6368]'}`}>
                  Consider adding a conclusion section to wrap up your arguments. Use phrases like "In conclusion" or "Overall" to signal your closing thoughts.
                </p>
              </div>
            </div>
          </Card>
        )}

        {analysis.citationCount < 3 && analysis.wordCount > 300 && (
          <Card className={`border border-[#FFC627]/50 p-4 rounded-xl shadow-sm ${darkMode ? 'bg-[#FFC627]/5' : 'bg-[#FFC627]/10'}`}>
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-[#8C1D40]/10 rounded-full flex items-center justify-center flex-shrink-0 text-lg">
                🤖
              </div>
              <div className="flex-1">
                <h4 className={`text-sm mb-1 text-left ${darkMode ? 'text-[#FFC627]' : 'text-[#8C1D40]'}`}>AI Suggestion</h4>
                <p className={`text-xs text-left ${darkMode ? 'text-gray-400' : 'text-[#5f6368]'}`}>
                  Your essay needs more citations. Try adding references like "According to Smith (2024)..." or "(Author, 2024)" to support your claims.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* ASU Branding Note */}
        <div className={`border border-[#8C1D40]/20 rounded-xl p-4 ${darkMode ? 'bg-gradient-to-r from-gray-900 to-gray-800' : 'bg-gradient-to-r from-[#8C1D40]/5 to-[#FFC627]/5'}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-[#8C1D40] rounded flex items-center justify-center">
              <ExternalLink className="w-3.5 h-3.5 text-white" />
            </div>
            <span className={`text-xs ${darkMode ? 'text-white' : 'text-[#202124]'}`}>Powered by ASU Inscribe</span>
          </div>
          <p className={`text-xs mb-3 text-left ${darkMode ? 'text-gray-400' : 'text-[#5f6368]'}`}>All writing resources are provided by Arizona State University's official writing guide platform.</p>
          <a 
            href="https://tutoring.asu.edu/online-study-hub"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button
              variant="outline"
              size="sm"
              className="w-full rounded-full text-xs h-8 border-[#8C1D40] text-[#8C1D40] hover:bg-[#8C1D40] hover:text-white transition-colors"
            >
              Visit ASU Online Study Hub
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t-2 border-[#FFC627] bg-[#8C1D40]/5">
        <div className="flex items-center justify-between text-xs text-[#5f6368]">
          <span>WriteTrack © 2024</span>
          <button className="hover:text-[#8C1D40] transition-colors">Help & Support</button>
        </div>
      </div>
    </div>
  );
}
