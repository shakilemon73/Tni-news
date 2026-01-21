
import { Eye, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox";
import { File } from 'lucide-react';
import { Article } from '@/types/database';

interface ArticlesTableProps {
  articles: Article[];
  isLoading: boolean;
  selectedArticles: string[];
  onSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onDelete: (id: string) => void;
  onResetFilters: () => void;
  getCategoryName: (categoryId: string) => string;
  searchQuery: string;
  categoryFilter: string;
  statusFilter: string;
}

export const ArticlesTable = ({
  articles,
  isLoading,
  selectedArticles,
  onSelect,
  onSelectAll,
  onDelete,
  onResetFilters,
  getCategoryName,
  searchQuery,
  categoryFilter,
  statusFilter
}: ArticlesTableProps) => {
  const navigate = useNavigate();

  // Format date to Bengali
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('bn-BD');
    } catch (e) {
      return '';
    }
  };

  const areAllArticlesSelected = articles.length > 0 && 
    articles.every(article => selectedArticles.includes(article.id));

  return (
    <Card>
      <CardHeader>
        <CardTitle>আর্টিকেলস</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : articles.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={areAllArticlesSelected}
                      onCheckedChange={onSelectAll}
                    />
                  </TableHead>
                  <TableHead>শিরোনাম</TableHead>
                  <TableHead>ক্যাটেগরি</TableHead>
                  <TableHead>তারিখ</TableHead>
                  <TableHead>ভিউ</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                  <TableHead className="text-right">অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedArticles.includes(article.id)}
                        onCheckedChange={(checked) => onSelect(article.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell className="max-w-xs truncate font-medium">
                      {article.title}
                    </TableCell>
                    <TableCell>
                      {article.category_ids && article.category_ids.length > 0 
                        ? article.category_ids.map(id => getCategoryName(id)).join(', ')
                        : '-'}
                    </TableCell>
                    <TableCell>{formatDate(article.created_at)}</TableCell>
                    <TableCell>{article.views || 0}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        article.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : article.status === 'draft'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {article.status === 'published' ? 'প্রকাশিত' : 
                         article.status === 'draft' ? 'খসড়া' : 'আর্কাইভ'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => article.slug && window.open(`/article/${article.slug}`, '_blank')}
                          disabled={!article.slug || article.status !== 'published'}
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/articles/edit/${article.id}`)}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => onDelete(article.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all' ? (
              <div>
                <File className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2">কোনো আর্টিকেল পাওয়া যায়নি</p>
                <Button 
                  variant="link"
                  onClick={onResetFilters}
                >
                  ফিল্টার রিসেট করুন
                </Button>
              </div>
            ) : (
              <div>
                <File className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2">কোনো আর্টিকেল নেই</p>
                <Button 
                  variant="link"
                  onClick={() => navigate('/admin/articles/new')}
                >
                  নতুন আর্টিকেল যোগ করুন
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
