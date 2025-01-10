import { AlertCircle, Copy, Lock, Save, Share2, Sparkles, Trash2, Zap } from "lucide-react";

export function PromptEditor() {
  return (
    <div className="flex-1 h-full bg-white flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
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
          <button className="inline-flex items-center px-4 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded text-white bg-blue-600 hover:bg-blue-700">
            <Save size={16} className="mr-1.5" />
            Save
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="h-full p-6">
          <div className="h-full">
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 h-full">
              <div className="px-4 py-5 sm:p-6 h-full">
                <div className="space-y-8 h-full flex flex-col">
                  {/* Basic Information */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Required</span>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Enter prompt title" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., 1.0.0" />
                        <p className="mt-1 text-sm text-gray-500">Semantic versioning (major.minor.patch)</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Briefly describe the purpose of this prompt"
                      />
                    </div>
                  </div>

                  {/* Classification */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Classification</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Optional</span>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                          <option value="">Select a category</option>
                          <option value="development">Development</option>
                          <option value="writing">Writing</option>
                          <option value="education">Education</option>
                          <option value="ai-ml">AI & ML</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter tags, separated by commas"
                        />
                        <p className="mt-1 text-sm text-gray-500">Example: translation, marketing, writing</p>
                      </div>
                    </div>
                  </div>

                  {/* Model Configuration */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Model Configuration</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Advanced</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-sm font-medium text-gray-700">Temperature</label>
                          <Sparkles size={14} className="text-gray-400" />
                        </div>
                        <input
                          type="number"
                          min="0"
                          max="2"
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.7"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-sm font-medium text-gray-700">Max Tokens</label>
                          <Zap size={14} className="text-gray-400" />
                        </div>
                        <input type="number" min="1" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="2000" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-sm font-medium text-gray-700">Model</label>
                          <Lock size={14} className="text-gray-400" />
                        </div>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                          <option value="gpt-4">GPT-4</option>
                          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                          <option value="gpt-4-turbo">GPT-4 Turbo</option>
                          <option value="claude-2">Claude 2</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-h-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <label className="block text-sm font-medium text-gray-700">Content</label>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Required</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <AlertCircle size={14} className="mr-1" />
                        Supports Markdown format
                      </div>
                    </div>
                    <textarea
                      className="w-full h-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono resize-none"
                      placeholder="Enter prompt content"
                      style={{ minHeight: "300px" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
