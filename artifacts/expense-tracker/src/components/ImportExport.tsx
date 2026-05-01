import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Download, Upload, CheckCircle, XCircle } from 'lucide-react';

interface ImportExportProps {
  onExport: () => void;
  onImport: (file: File, merge: boolean) => Promise<{ success: boolean; message: string }>;
}

export function ImportExport({ onExport, onImport }: ImportExportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    setImportResult(null);
  };

  const handleImport = async (merge: boolean) => {
    if (!selectedFile) return;
    setLoading(true);
    const result = await onImport(selectedFile, merge);
    setImportResult(result);
    setLoading(false);
    if (result.success) {
      setTimeout(() => {
        setImportOpen(false);
        setSelectedFile(null);
        setImportResult(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 1500);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          data-testid="button-export"
          onClick={onExport}
          className="border-border text-muted-foreground hover:text-foreground text-xs gap-1.5"
        >
          <Download className="h-3.5 w-3.5" />
          Exportar
        </Button>
        <Button
          variant="outline"
          size="sm"
          data-testid="button-import-open"
          onClick={() => setImportOpen(true)}
          className="border-border text-muted-foreground hover:text-foreground text-xs gap-1.5"
        >
          <Upload className="h-3.5 w-3.5" />
          Importar
        </Button>
      </div>

      <Dialog open={importOpen} onOpenChange={(v) => {
        if (!v) {
          setImportOpen(false);
          setSelectedFile(null);
          setImportResult(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      }}>
        <DialogContent className="sm:max-w-md bg-card border-card-border">
          <DialogHeader>
            <DialogTitle>Importar datos</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Selecciona un archivo JSON exportado previamente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div
              data-testid="drop-zone"
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              {selectedFile ? (
                <div>
                  <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Clic para seleccionar archivo .json</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                data-testid="input-file"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {importResult && (
              <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                importResult.success
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}>
                {importResult.success
                  ? <CheckCircle className="h-4 w-4 shrink-0" />
                  : <XCircle className="h-4 w-4 shrink-0" />
                }
                {importResult.message}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                data-testid="button-import-replace"
                disabled={!selectedFile || loading}
                onClick={() => handleImport(false)}
                className="flex-1 border-border text-sm"
              >
                Reemplazar
              </Button>
              <Button
                data-testid="button-import-merge"
                disabled={!selectedFile || loading}
                onClick={() => handleImport(true)}
                className="flex-1 bg-primary text-primary-foreground text-sm"
              >
                {loading ? 'Importando...' : 'Fusionar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
