import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Article, Category } from '@/types/database';
import { getArticles, getCategories } from '@/lib/services';
import { bulkActionArticles, deleteArticle } from '@/lib/services/article-service';

// Import our components
import { ArticleFilters } from '@/components/admin/articles/ArticleFilters';
import { BulkActionBar } from '@/components/admin/articles/BulkActionBar';
import { ArticlesTable } from '@/components/admin/articles/ArticlesTable';
import { DeleteArticleDialog } from '@/components/admin/articles/DeleteArticleDialog';
import { BulkActionDialog } from '@/components/admin/articles/BulkActionDialog';

const AdminArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [showBulkActionDialog, setShowBulkActionDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState<string | null>(null);
  const [isBulkActioning, setIsBulkActioning] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      const data = await getArticles();
      setArticles(data as Article[]);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('আর্টিকেল লোড করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data as Category[]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDeleteClick = (id: string) => {
    setArticleToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!articleToDelete) return;
    
    try {
      setIsDeleting(true);
      await deleteArticle(articleToDelete);
      setArticles(articles.filter(article => article.id !== articleToDelete));
      toast.success('আর্টিকেল সফলভাবে মুছে ফেলা হয়েছে');
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('আর্টিকেল মুছতে সমস্যা হয়েছে');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectAllArticles = (checked: boolean) => {
    if (checked) {
      const allIds = filteredArticles.map(article => article.id);
      setSelectedArticles(allIds);
    } else {
      setSelectedArticles([]);
    }
  };

  const handleSelectArticle = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedArticles(prev => [...prev, id]);
    } else {
      setSelectedArticles(prev => prev.filter(articleId => articleId !== id));
    }
  };

  const handleBulkAction = (action: string) => {
    setBulkAction(action);
    setShowBulkActionDialog(true);
  };

  const handleBulkActionConfirm = async () => {
    if (!bulkAction || selectedArticles.length === 0) return;
    
    try {
      setIsBulkActioning(true);
      await bulkActionArticles(selectedArticles, bulkAction);
      await fetchArticles();
      
      let actionText = '';
      if (bulkAction === 'publish') actionText = 'প্রকাশিত';
      else if (bulkAction === 'archive') actionText = 'আর্কাইভ';
      else if (bulkAction === 'draft') actionText = 'খসড়া';
      
      toast.success(`${selectedArticles.length} আর্টিকেল ${actionText} করা হয়েছে`);
      setSelectedArticles([]);
      setShowBulkActionDialog(false);
    } catch (error) {
      console.error(`Error performing bulk action '${bulkAction}':`, error);
      toast.error('বাল্ক অ্যাকশন করতে সমস্যা হয়েছে');
    } finally {
      setIsBulkActioning(false);
      setBulkAction(null);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : '';
  };

  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setStatusFilter('all');
  };

  const hasActiveFilters = searchQuery || categoryFilter !== 'all' || statusFilter !== 'all';

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || 
                           (article.category_ids && 
                            article.category_ids.some(id => id === categoryFilter));
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const isAnyArticleSelected = selectedArticles.length > 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">আর্টিকেল ম্যানেজমেন্ট</h1>
          <p className="text-muted-foreground mt-1">
            মোট {articles.length}টি আর্টিকেল
            {hasActiveFilters && ` • ফিল্টার করা ${filteredArticles.length}টি`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Mobile filter toggle */}
          <Button 
            variant="outline" 
            size="icon"
            className="sm:hidden h-10 w-10"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
          </Button>
          <Button 
            onClick={() => navigate('/admin/articles/new')} 
            className="flex-1 sm:flex-none gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>নতুন আর্টিকেল</span>
          </Button>
        </div>
      </div>
      
      {/* Filters - Collapsible on mobile */}
      <div className={`${showFilters ? 'block' : 'hidden'} sm:block`}>
        <ArticleFilters 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          categories={categories}
        />
      </div>
      
      {/* Bulk Actions */}
      {isAnyArticleSelected && (
        <BulkActionBar
          selectedCount={selectedArticles.length}
          onPublish={() => handleBulkAction('publish')}
          onArchive={() => handleBulkAction('archive')}
          onDraft={() => handleBulkAction('draft')}
          onClearSelection={() => setSelectedArticles([])}
        />
      )}
      
      {/* Articles Table */}
      <ArticlesTable 
        articles={filteredArticles}
        isLoading={isLoading}
        selectedArticles={selectedArticles}
        onSelect={handleSelectArticle}
        onSelectAll={handleSelectAllArticles}
        onDelete={handleDeleteClick}
        onResetFilters={resetFilters}
        getCategoryName={getCategoryName}
        searchQuery={searchQuery}
        categoryFilter={categoryFilter}
        statusFilter={statusFilter}
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteArticleDialog 
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
      
      {/* Bulk Action Confirmation Dialog */}
      <BulkActionDialog 
        open={showBulkActionDialog}
        onOpenChange={setShowBulkActionDialog}
        onConfirm={handleBulkActionConfirm}
        isProcessing={isBulkActioning}
        action={bulkAction}
        count={selectedArticles.length}
      />
    </div>
  );
};

export default AdminArticles;
