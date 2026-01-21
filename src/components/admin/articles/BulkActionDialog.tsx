
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

interface BulkActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isProcessing: boolean;
  action: string | null;
  count: number;
}

export const BulkActionDialog = ({
  open,
  onOpenChange,
  onConfirm,
  isProcessing,
  action,
  count,
}: BulkActionDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {action === 'publish' ? 'আর্টিকেল প্রকাশ করতে চান?' : 
             action === 'archive' ? 'আর্টিকেল আর্কাইভ করতে চান?' : 
             'আর্টিকেল খসড়া করতে চান?'}
          </DialogTitle>
          <DialogDescription>
            {count} টি আর্টিকেল
            {action === 'publish' ? ' প্রকাশ' : 
             action === 'archive' ? ' আর্কাইভ' : 
             ' খসড়া'} করা হবে।
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            বাতিল
          </Button>
          <Button 
            variant={action === 'archive' ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                প্রক্রিয়া চলছে...
              </span>
            ) : (
              'নিশ্চিত করুন'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
