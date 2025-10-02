import { type FileWithPreview, fileGroups, getFileType } from "../utils";

export interface FilePreviewsProps {
  files: FileWithPreview[];
  onRemove?: (fileId: string) => void;
}

const FileIcon = ({
  type,
  className = "",
}: {
  type: string;
  className?: string;
}) => {
  const group =
    fileGroups.find((g) => g.type === type) ||
    fileGroups.find((g) => g.type === "other")!;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <group.icon />
      <span className="text-xs text-gray-500">{group.label}</span>
    </div>
  );
};

export const ImagePreview = ({
  file,
  onRemove,
}: {
  file: FileWithPreview;
  onRemove?: (fileId: string) => void;
}) => {
  return (
    <div className="relative group w-full">
      <img
        src={file.preview}
        alt={file.name}
        className="w-full rounded-sm transition-transform group-hover:scale-105"
      />
      {onRemove && (
        <button
          onClick={() => onRemove(file.id)}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm"
        >
          ×
        </button>
      )}
    </div>
  );
};

export const NonImagePreview = ({
  file,
  onRemove,
}: {
  file: FileWithPreview;
  onRemove?: (fileId: string) => void;
}) => {
  return (
    <div className="relative group border rounded-sm p-4 transition-colors duration-300 hover:bg-accent hover:scale-105">
      <FileIcon type={getFileType(file)} />
      {onRemove && (
        <button
          onClick={() => onRemove(file.id)}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm"
        >
          ×
        </button>
      )}
      <div className="mt-2 text-xs truncate text-center">{file.name}</div>
      <div className="text-xs text-gray-400 text-center">
        {(file.size / 1024 / 1024).toFixed(2)} MB
      </div>
    </div>
  );
};
