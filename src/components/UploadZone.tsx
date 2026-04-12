import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image as ImageIcon, X } from "lucide-react";

interface UploadZoneProps {
  onImageUpload: (file: File, preview: string) => void;
  uploadedImage: string | null;
  onClear: () => void;
  itemDescription: string;
  onItemDescriptionChange: (value: string) => void;
}

const UploadZone = ({ onImageUpload, uploadedImage, onClear, itemDescription, onItemDescriptionChange }: UploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file?.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (ev) => onImageUpload(file, ev.target?.result as string);
        reader.readAsDataURL(file);
      }
    },
    [onImageUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => onImageUpload(file, ev.target?.result as string);
        reader.readAsDataURL(file);
      }
    },
    [onImageUpload]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <AnimatePresence mode="wait">
        {uploadedImage ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-lg overflow-hidden border border-border bg-card aspect-square max-w-xs mx-auto"
          >
            <img
              src={uploadedImage}
              alt="Uploaded clothing item"
              className="w-full h-full object-cover"
            />
            <button
              onClick={onClear}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-foreground/80 text-primary-foreground hover:bg-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3"
          >
            <label className="block font-display text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
              Describe your item <span className="normal-case tracking-normal text-muted-foreground/60">(optional)</span>
            </label>
            <input
              type="text"
              value={itemDescription}
              onChange={(e) => onItemDescriptionChange(e.target.value)}
              placeholder="e.g. navy blue crew-neck sweater"
              maxLength={150}
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all placeholder:text-muted-foreground/50"
            />
            <p className="text-[10px] text-muted-foreground/60 mt-1">
              Help the AI if it doesn't recognize your item correctly
            </p>
          </motion.div>
        ) : (
          <motion.label
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            htmlFor="file-upload"
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`
              flex flex-col items-center justify-center gap-4 p-12
              border-2 border-dashed rounded-lg cursor-pointer
              transition-all duration-300
              ${isDragging
                ? "border-accent bg-accent/5 scale-[1.02]"
                : "border-border hover:border-accent/50 hover:bg-card"
              }
            `}
          >
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
              {isDragging ? (
                <ImageIcon className="w-7 h-7 text-accent" />
              ) : (
                <Upload className="w-7 h-7 text-muted-foreground" />
              )}
            </div>
            <div className="text-center">
              <p className="font-display text-lg text-foreground">
                Drop your clothing item here
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse · JPG, PNG, WEBP
              </p>
            </div>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </motion.label>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UploadZone;
