import { useState, useEffect } from 'react';
import { Plus, Loader2, FolderTree, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createCategory, getCategories, updateCategory, deleteCategory } from '@/lib/services/category-service';
import { useInvalidateCategories } from '@/hooks/use-categories';
import { CategoriesTable } from '@/components/admin/categories/CategoriesTable';
import { CategoryForm } from '@/components/admin/categories/CategoryForm';
import { DeleteCategoryDialog } from '@/components/admin/categories/DeleteCategoryDialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Category } from '@/types/database';

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const invalidateCategories = useInvalidateCategories();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const data = await getCategories();
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('ক্যাটেগরি লোড করতে সমস্যা হয়েছে', {
        description: 'দয়া করে আবার চেষ্টা করুন।'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCategory = async (category: Partial<Category>) => {
    try {
      if (categoryToEdit) {
        await updateCategory(categoryToEdit.id, category);
        toast.success('ক্যাটেগরি আপডেট হয়েছে', {
          description: `${category.name} সফলভাবে আপডেট করা হয়েছে`
        });
      } else {
        await createCategory(category);
        toast.success('ক্যাটেগরি তৈরি হয়েছে', {
          description: `${category.name} সফলভাবে তৈরি করা হয়েছে`
        });
      }
      
      fetchCategories();
      invalidateCategories();
      setIsFormOpen(false);
      setCategoryToEdit(null);
    } catch (error: any) {
      console.error('Error saving category:', error);
      if (error.message?.includes('row-level security')) {
        toast.error('অনুমতি নেই', {
          description: 'এই কাজটি করার অনুমতি নেই। আপনি এডিটর বা অ্যাডমিন কিনা নিশ্চিত করুন।'
        });
      } else if (error.message?.includes('duplicate key')) {
        toast.error('স্লাগ বিদ্যমান', {
          description: 'এই স্লাগ দিয়ে ইতিমধ্যে একটি ক্যাটেগরি আছে'
        });
      } else {
        toast.error('ক্যাটেগরি সংরক্ষণ করতে সমস্যা হয়েছে');
      }
    }
  };

  const handleEditClick = (category: Category) => {
    setCategoryToEdit(category);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setCategoryToDelete(id);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    
    try {
      setIsDeleting(true);
      await deleteCategory(categoryToDelete);
      
      toast.success('ক্যাটেগরি মুছে ফেলা হয়েছে');
      
      fetchCategories();
      invalidateCategories();
      setCategoryToDelete(null);
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('ক্যাটেগরি মুছতে সমস্যা হয়েছে');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">ক্যাটেগরি ম্যানেজমেন্ট</h1>
          <p className="text-muted-foreground mt-1">
            মোট {categories.length}টি ক্যাটেগরি
          </p>
        </div>
        <Button 
          onClick={() => {
            setCategoryToEdit(null);
            setIsFormOpen(true);
          }} 
          className="flex-1 sm:flex-none gap-2"
        >
          <FolderPlus className="h-4 w-4" />
          <span>নতুন ক্যাটেগরি</span>
        </Button>
      </div>
      
      {/* Category Form */}
      {isFormOpen && (
        <Card className="border-primary/20 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FolderTree className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  {categoryToEdit ? 'ক্যাটেগরি সম্পাদনা' : 'নতুন ক্যাটেগরি'}
                </CardTitle>
                <CardDescription>
                  {categoryToEdit ? 'ক্যাটেগরির তথ্য পরিবর্তন করুন' : 'একটি নতুন ক্যাটেগরি তৈরি করুন'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CategoryForm 
              initialData={categoryToEdit}
              onSave={handleSaveCategory}
              onCancel={() => {
                setIsFormOpen(false);
                setCategoryToEdit(null);
              }}
              categories={categories}
            />
          </CardContent>
        </Card>
      )}
      
      {/* Categories List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">ক্যাটেগরি লোড হচ্ছে...</p>
        </div>
      ) : (
        <CategoriesTable 
          categories={categories}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      )}
      
      <DeleteCategoryDialog 
        open={!!categoryToDelete}
        onOpenChange={(open) => !open && setCategoryToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default AdminCategories;
