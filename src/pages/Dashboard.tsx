import { PromptEditor } from "@/components/dashboard/PromptEditor";
import { PromptList } from "@/components/dashboard/PromptList";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { useState } from "react";

export default function Dashboard() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);

  return (
    <div className="flex h-screen">
      <Sidebar onCategorySelect={setSelectedCategoryId} selectedCategoryId={selectedCategoryId} />
      <div className="flex-1 flex">
        <div className="w-[320px] border-r border-gray-200">
          <PromptList categoryId={selectedCategoryId} onPromptSelect={setSelectedPromptId} selectedPromptId={selectedPromptId} />
        </div>
        <div className="flex-1">
          <PromptEditor promptId={selectedPromptId} onSave={() => setSelectedPromptId(null)} />
        </div>
      </div>
    </div>
  );
}
