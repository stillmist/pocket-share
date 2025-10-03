import { useState } from "react";

export function useSelection() {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  // Direct update functions - no callbacks to avoid closures
  const toggleSelection = (fileId: string) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = (allFileIds: string[]) => {
    setSelectedFiles((prev) => {
      if (prev.size === allFileIds.length) {
        return new Set();
      } else {
        return new Set(allFileIds);
      }
    });
  };

  const clearSelection = () => {
    setSelectedFiles(new Set());
  };

  return {
    selectedFiles,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
  };
}
