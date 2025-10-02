import Masonry from "react-masonry-css";
import { type FileWithPreview } from "../utils";
import { ImagePreview } from "./file-previews";

interface MasonryGridProps {
  files: FileWithPreview[];
  onRemove?: (fileId: string) => void;
}

export function MasonryGrid({ files, onRemove }: MasonryGridProps) {
  const breakpointColumns = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };

  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className="flex -ml-4 w-auto"
      columnClassName="pl-4 bg-clip-padding"
    >
      {files.map((file) => (
        <div key={file.id} className="mb-4">
          <ImagePreview file={file} onRemove={onRemove} />
        </div>
      ))}
    </Masonry>
  );
}
