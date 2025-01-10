import { AlertCircle, ChevronDown, ChevronUp, Copy, Gauge, Save, Share2, Sparkles, Trash2, Zap } from "lucide-react";
import { useState } from "react";

export function PromptEditor() {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="flex-1 h-full bg-gray-50 flex flex-col">
      <div className="p-3 border-b border-gray-200 bg-white flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="font-medium">Edit Prompt</h2>
          <span className="text-sm text-gray-500">Version 2.1.0</span>
        </div>
        <div className="flex items-center space-x-2">
          <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
            <Copy size={16} className="mr-1.5" />
            Copy
          </button>
          <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
            <Share2 size={16} className="mr-1.5" />
            Share
          </button>
          <button className="inline-flex items-center px-3 py-1.5 border border-red-200 shadow-sm text-sm font-medium rounded text-red-600 bg-white hover:bg-red-50">
            <Trash2 size={16} className="mr-1.5" />
            Delete
          </button>
          <button className="inline-flex items-center px-4 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded text-white bg-[#2C106A] hover:bg-[#3A1A7D]">
            <Save size={16} className="mr-1.5" />
            Save
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="w-full px-2">
          <div className="space-y-4">
            {/* Basic Information */}
            <section className="bg-white border-b border-gray-200">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium text-gray-900">Basic Information</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-blue-100 text-blue-800">Required</span>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-white border border-gray-200 focus:ring-[#2C106A] focus:border-[#2C106A] hover:border-gray-300"
                      placeholder="Enter prompt title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                    <input type="text" className="w-full px-3 py-2 bg-white border border-gray-200 focus:ring-[#2C106A] focus:border-[#2C106A] hover:border-gray-300" placeholder="e.g., 1.0.0" />
                    <p className="mt-1 text-sm text-gray-500">Semantic versioning (major.minor.patch)</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-white border border-gray-200 focus:ring-[#2C106A] focus:border-[#2C106A] hover:border-gray-300"
                    placeholder="Briefly describe the purpose of this prompt"
                  />
                </div>
              </div>
            </section>

            {/* Classification */}
            <section className="bg-white border-b border-gray-200">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium text-gray-900">Classification</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-green-100 text-green-800">Optional</span>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                  <div className="lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select className="w-full px-3 py-2 bg-white border border-gray-200 focus:ring-[#2C106A] focus:border-[#2C106A] hover:border-gray-300">
                      <option value="">Select a category</option>
                      <option value="development">Development</option>
                      <option value="writing">Writing</option>
                      <option value="education">Education</option>
                      <option value="ai-ml">AI & ML</option>
                    </select>
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-white border border-gray-200 focus:ring-[#2C106A] focus:border-[#2C106A] hover:border-gray-300"
                      placeholder="Enter tags, separated by commas"
                    />
                    <p className="mt-1 text-sm text-gray-500">Example: translation, marketing, writing</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Model Configuration */}
            <section className="bg-white border-b border-gray-200">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium text-gray-900">Model Configuration</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-purple-100 text-purple-800">Advanced</span>
                </div>
              </div>
              <div>
                <button onClick={() => setShowAdvanced(!showAdvanced)} className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-2">
                    <Gauge size={18} className="text-gray-400" />
                    <span className="text-sm text-gray-600">Configure model parameters</span>
                  </div>
                  {showAdvanced ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </button>
                {showAdvanced && (
                  <div className="px-4 py-3 border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div className="md:col-span-2">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-sm font-medium text-gray-700">Temperature</label>
                          <Sparkles size={14} className="text-gray-400" />
                        </div>
                        <input
                          type="number"
                          min="0"
                          max="2"
                          step="0.1"
                          className="w-full px-3 py-2 bg-white border border-gray-200 focus:ring-[#2C106A] focus:border-[#2C106A] hover:border-gray-300"
                          placeholder="0.7"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-sm font-medium text-gray-700">Max Tokens</label>
                          <Zap size={14} className="text-gray-400" />
                        </div>
                        <input
                          type="number"
                          min="1"
                          className="w-full px-3 py-2 bg-white border border-gray-200 focus:ring-[#2C106A] focus:border-[#2C106A] hover:border-gray-300"
                          placeholder="2000"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-sm font-medium text-gray-700">Model</label>
                          <Gauge size={14} className="text-gray-400" />
                        </div>
                        <select className="w-full px-3 py-2 bg-white border border-gray-200 focus:ring-[#2C106A] focus:border-[#2C106A] hover:border-gray-300">
                          <option value="gpt-4">GPT-4</option>
                          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                          <option value="gpt-4-turbo">GPT-4 Turbo</option>
                          <option value="claude-2">Claude 2</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Content */}
            <section className="bg-white border-b border-gray-200">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-medium text-gray-900">Content</h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-blue-100 text-blue-800">Required</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <AlertCircle size={14} className="mr-1" />
                    Supports Markdown format
                  </div>
                </div>
              </div>
              <div className="p-4">
                <textarea
                  className="w-full h-full px-3 py-2 bg-white border border-gray-200 focus:ring-[#2C106A] focus:border-[#2C106A] hover:border-gray-300 font-mono resize-none"
                  placeholder="Enter prompt content"
                  style={{ minHeight: "300px" }}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
