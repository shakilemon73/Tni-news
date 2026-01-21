
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

interface DeleteArticleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export const DeleteArticleDialog = ({
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}: DeleteArticleDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>আর্টিকেল মুছে ফেলতে চান?</DialogTitle>
          <DialogDescription>
            এই কাজটি অসম্পূর্ণ। একবার মুছে ফেললে আর ফিরে পাওয়া যাবে না।
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            বাতিল
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                মুছে ফেলা হচ্ছে...
              </span>
            ) : (
              'মুছে ফেলুন'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
