import { useState, useRef, useEffect } from "react";
import { WriteTrackSidebar } from "./components/WriteTrackSidebar";
import { RubricUploadScreen } from "./components/RubricUploadScreen";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  Image,
  MoreVertical,
  Download,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";

export interface RubricRequirement {
  id: string;
  title: string;
  description: string;
  asuLink: string;
  checkFunction: (content: string, analysis: any) => boolean;
}

export default function App() {
  const [rubricUploaded, setRubricUploaded] = useState(false);
  const [rubricRequirements, setRubricRequirements] = useState<
    RubricRequirement[]
  >([]);
  const [documentContent, setDocumentContent] = useState("");
  const [documentTitle, setDocumentTitle] = useState(
    "Untitled Document",
  );
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("writetrack-theme");
    return saved === "dark";
  });
  const editorRef = useRef<HTMLDivElement>(null);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("writetrack-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("writetrack-theme", "light");
    }
  }, [darkMode]);

  // Real-time analysis function
  const analyzeContent = (content: string) => {
    // Strip HTML tags for accurate word counting
    const textContent = content
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ");
    const trimmedContent = textContent.trim();
    const wordCount =
      trimmedContent === ""
        ? 0
        : trimmedContent
            .split(/\s+/)
            .filter((word) => word.length > 0).length;

    // Check for thesis statement
    const firstPortion = textContent
      .substring(0, 500)
      .toLowerCase();
    const hasThesis =
      /\b(this essay examines|this paper argues|this study explores|argues that|demonstrates that|examines|explores)\b/i.test(
        firstPortion,
      ) || textContent.length > 300;

    // Check for academic citations
    const citationPatterns = [
      /\([A-Z][a-z]+.*?\d{4}\)/g,
      /[A-Z][a-z]+\s+et\s+al\./g,
      /[A-Z][a-z]+\s+and\s+[A-Z][a-z]+\s+\(\d{4}\)/g,
      /[A-Z][a-z]+\s+and\s+colleagues/g,
    ];

    let citations: string[] = [];
    citationPatterns.forEach((pattern) => {
      const matches = textContent.match(pattern);
      if (matches) citations.push(...matches);
    });
    const citationCount = citations.length;

    // Check for introduction
    const hasIntroduction = wordCount >= 50;

    // Check for conclusion keywords
    const conclusionKeywords =
      /\b(in conclusion|to conclude|in summary|to summarize|finally|therefore|thus|overall|ultimately)\b/i;
    const hasConclusion = conclusionKeywords.test(textContent);

    // Check organization
    const paragraphs = textContent
      .split("\n\n")
      .filter((p) => p.trim().length > 50);
    const hasOrganization =
      paragraphs.length >= 3 && wordCount >= 500;

    // Check writing mechanics
    const hasSentences =
      textContent
        .split(/[.!?]+/)
        .filter((s) => s.trim().length > 10).length >= 5;
    const hasProperCapitalization = /[A-Z]/.test(textContent);
    const hasGoodMechanics =
      hasSentences &&
      hasProperCapitalization &&
      wordCount > 200;

    return {
      wordCount,
      hasThesis,
      citationCount,
      hasIntroduction,
      hasConclusion,
      hasOrganization,
      hasGoodMechanics,
    };
  };

  const analysis = analyzeContent(documentContent);

  // Calculate which requirements are met
  const checkedItems = rubricRequirements.reduce(
    (acc, req) => {
      acc[req.id] = req.checkFunction(
        documentContent,
        analysis,
      );
      return acc;
    },
    {} as Record<string, boolean>,
  );

  const handleRubricUpload = (
    requirements: RubricRequirement[],
  ) => {
    setRubricRequirements(requirements);
    setRubricUploaded(true);
    // Start with empty document
    setDocumentContent("");
    setDocumentTitle("Untitled Document");
  };

  // Handle content changes from contentEditable
  const handleInput = () => {
    if (editorRef.current) {
      setDocumentContent(editorRef.current.innerHTML);
    }
  };

  // Handle paste to ensure text is white
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  // Format text functions
  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  // Download functions
  const downloadAsHTML = () => {
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${documentTitle}</title>
  <style>
    body {
      font-family: 'Times New Roman', Times, serif;
      max-width: 8.5in;
      margin: 1in auto;
      line-height: 1.75;
      font-size: 12pt;
    }
    h1 {
      text-align: center;
      margin-bottom: 1em;
    }
  </style>
</head>
<body>
  <h1>${documentTitle}</h1>
  ${documentContent || "<p>No content</p>"}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${documentTitle || "document"}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAsText = () => {
    const textContent = editorRef.current?.innerText || "";
    const blob = new Blob(
      [`${documentTitle}\n\n${textContent}`],
      { type: "text/plain" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${documentTitle || "document"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAsWord = () => {
    const htmlContent = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${documentTitle}</title>
  <style>
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.75;
    }
    h1 {
      text-align: center;
      margin-bottom: 1em;
    }
  </style>
</head>
<body>
  <h1>${documentTitle}</h1>
  ${documentContent || "<p>No content</p>"}
</body>
</html>`;

    const blob = new Blob(["\ufeff", htmlContent], {
      type: "application/msword",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${documentTitle || "document"}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Show upload screen if rubric not uploaded
  if (!rubricUploaded) {
    return (
      <RubricUploadScreen
        onUpload={handleRubricUpload}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
    );
  }

  return (
    <div
      className={`min-h-screen flex ${darkMode ? "bg-gray-900" : "bg-[#F1F3F4]"}`}
    >
      {/* Left Panel - Writing Workspace */}
      <div
        className={`flex-1 p-8 ${darkMode ? "bg-gray-700" : "bg-[rgba(114,114,114,0)]"}`}
      >
        <div
          className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-sm max-w-[800px] mx-auto`}
        >
          {/* Google Docs Style Toolbar */}
          <div
            className={`border-b ${darkMode ? "border-gray-700" : "border-gray-200"} px-6 py-3`}
          >
            <div className="flex items-center gap-1 mb-3">
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={documentTitle}
                  onChange={(e) =>
                    setDocumentTitle(e.target.value)
                  }
                  className={`${darkMode ? "text-white" : "text-[#202124]"} bg-transparent border-none outline-none w-full`}
                  placeholder="Untitled Document"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                    <Download className="w-4 h-4 text-[#5f6368]" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48"
                >
                  <DropdownMenuItem onClick={downloadAsWord}>
                    <Download className="w-4 h-4 mr-2" />
                    Download as Word (.doc)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={downloadAsHTML}>
                    <Download className="w-4 h-4 mr-2" />
                    Download as HTML
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={downloadAsText}>
                    <Download className="w-4 h-4 mr-2" />
                    Download as Text (.txt)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <button className="p-2 hover:bg-gray-100 rounded">
                <MoreVertical className="w-4 h-4 text-[#5f6368]" />
              </button>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => formatText("bold")}
                className={`p-1.5 rounded transition-colors ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              >
                <Bold
                  className={`w-4 h-4 ${darkMode ? "text-gray-300" : "text-[#5f6368]"}`}
                />
              </button>
              <button
                onClick={() => formatText("italic")}
                className={`p-1.5 rounded transition-colors ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              >
                <Italic
                  className={`w-4 h-4 ${darkMode ? "text-gray-300" : "text-[#5f6368]"}`}
                />
              </button>
              <button
                onClick={() => formatText("underline")}
                className={`p-1.5 rounded transition-colors ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              >
                <Underline
                  className={`w-4 h-4 ${darkMode ? "text-gray-300" : "text-[#5f6368]"}`}
                />
              </button>
              <div
                className={`w-px h-6 mx-2 ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}
              />
              <button
                onClick={() => formatText("justifyLeft")}
                className={`p-1.5 rounded transition-colors ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              >
                <AlignLeft
                  className={`w-4 h-4 ${darkMode ? "text-gray-300" : "text-[#5f6368]"}`}
                />
              </button>
              <button
                onClick={() => formatText("justifyCenter")}
                className={`p-1.5 rounded transition-colors ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              >
                <AlignCenter
                  className={`w-4 h-4 ${darkMode ? "text-gray-300" : "text-[#5f6368]"}`}
                />
              </button>
              <button
                onClick={() => formatText("justifyRight")}
                className={`p-1.5 rounded transition-colors ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              >
                <AlignRight
                  className={`w-4 h-4 ${darkMode ? "text-gray-300" : "text-[#5f6368]"}`}
                />
              </button>
              <div
                className={`w-px h-6 mx-2 ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}
              />
              <button
                onClick={() =>
                  formatText(
                    "createLink",
                    prompt("Enter URL:") || "",
                  )
                }
                className={`p-1.5 rounded transition-colors ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              >
                <Link2
                  className={`w-4 h-4 ${darkMode ? "text-gray-300" : "text-[#5f6368]"}`}
                />
              </button>
              <button
                onClick={() =>
                  formatText(
                    "insertImage",
                    prompt("Enter image URL:") || "",
                  )
                }
                className={`p-1.5 rounded transition-colors ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              >
                <Image
                  className={`w-4 h-4 ${darkMode ? "text-gray-300" : "text-[#5f6368]"}`}
                />
              </button>
              <div className="flex-1" />
              <div
                className={`text-xs px-3 py-1 rounded ${darkMode ? "text-gray-300 bg-gray-700" : "text-[#5f6368] bg-gray-50"}`}
              >
                {analysis.wordCount} words
              </div>
            </div>
          </div>

          {/* Editable Document Content */}
          <div className="p-16 min-h-[800px]">
            <div
              ref={editorRef}
              contentEditable
              onInput={handleInput}
              onPaste={handlePaste}
              className={`w-full min-h-[700px] leading-relaxed outline-none ${darkMode ? "text-white" : "text-black"}`}
              data-placeholder="Start typing your essay here..."
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                lineHeight: "1.75",
              }}
            />
          </div>
        </div>
      </div>

      {/* Right Panel - WriteTrack Sidebar */}
      <WriteTrackSidebar
        requirements={rubricRequirements}
        checkedItems={checkedItems}
        analysis={analysis}
        onReset={() => setRubricUploaded(false)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
    </div>
  );
}