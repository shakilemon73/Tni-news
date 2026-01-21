import { Article, Category } from '@/types/database';
import { SiteSettings } from '@/types/database';

// Helper to strip HTML tags
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

// Helper to truncate text
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

// Format date in Bengali
function formatBengaliDate(dateStr: string): string {
  const date = new Date(dateStr);
  const bengaliMonths = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];
  const bengaliDays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  
  const day = date.getDate();
  const month = bengaliMonths[date.getMonth()];
  const year = date.getFullYear();
  const weekday = bengaliDays[date.getDay()];
  
  return `${weekday}, ${day} ${month} ${year}`;
}

// Convert number to Bengali
function toBengaliNumber(num: number): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().split('').map(d => bengaliDigits[parseInt(d)] || d).join('');
}

export interface GenerateNewspaperHTMLOptions {
  articles: Article[];
  categories: Category[];
  settings: Partial<SiteSettings>;
  publishDate: string;
}

// Generate HTML for newspaper PDF
export function generateNewspaperHTML(options: GenerateNewspaperHTMLOptions): string {
  const { articles, categories, settings, publishDate } = options;
  
  const siteName = settings.site_name || 'বাংলা সংবাদ';
  const formattedDate = formatBengaliDate(publishDate);
  
  // Create category map
  const categoryMap = new Map(categories.map(c => [c.id, c]));
  
  // Group articles by category
  const articlesByCategory: Record<string, Article[]> = {};
  articles.forEach(article => {
    const catId = article.category_ids?.[0] || 'uncategorized';
    if (!articlesByCategory[catId]) {
      articlesByCategory[catId] = [];
    }
    articlesByCategory[catId].push(article);
  });
  
  // Get top headline (first article)
  const topHeadline = articles[0];
  const secondaryArticles = articles.slice(1, 4);
  const remainingArticles = articles.slice(4);
  
  let html = `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${siteName} - ${formattedDate}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700;800&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Noto Sans Bengali', sans-serif;
      background: white;
      color: #1a1a1a;
      line-height: 1.6;
    }
    
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 15mm;
      margin: 0 auto;
      background: white;
      page-break-after: always;
    }
    
    @media print {
      .page { page-break-after: always; }
    }
    
    .masthead {
      text-align: center;
      border-bottom: 4px double #000;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    
    .masthead-logo { max-height: 60px; margin-bottom: 8px; }
    .masthead-title { font-size: 48px; font-weight: 800; letter-spacing: 2px; margin-bottom: 5px; }
    .masthead-tagline { font-size: 14px; color: #666; }
    
    .masthead-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #666;
    }
    
    .headlines-bar {
      display: flex;
      gap: 10px;
      background: #f8f9fa;
      padding: 10px;
      margin-bottom: 20px;
      border: 1px solid #e0e0e0;
    }
    
    .headline-item {
      flex: 1;
      padding: 8px 12px;
      background: white;
      border-left: 3px solid #c41e3a;
      font-size: 11px;
    }
    
    .headline-item-category {
      color: #c41e3a;
      font-weight: 600;
      font-size: 9px;
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    
    .main-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 20px;
      margin-bottom: 25px;
    }
    
    .top-headline {
      border-bottom: 2px solid #000;
      padding-bottom: 20px;
      margin-bottom: 20px;
    }
    
    .top-headline-title { font-size: 32px; font-weight: 700; line-height: 1.3; margin-bottom: 12px; }
    .top-headline-image { width: 100%; height: 250px; object-fit: cover; margin-bottom: 12px; }
    .top-headline-content { font-size: 14px; text-align: justify; column-count: 2; column-gap: 20px; }
    
    .secondary-articles {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 20px;
      margin-bottom: 20px;
    }
    
    .secondary-article { border-left: 1px solid #ddd; padding-left: 15px; }
    .secondary-article:first-child { border-left: none; padding-left: 0; }
    .secondary-article-image { width: 100%; height: 120px; object-fit: cover; margin-bottom: 10px; }
    .secondary-article-title { font-size: 16px; font-weight: 600; line-height: 1.4; margin-bottom: 8px; }
    .secondary-article-excerpt { font-size: 12px; color: #444; text-align: justify; }
    
    .category-section { margin-bottom: 25px; }
    
    .category-header {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      border-bottom: 2px solid #c41e3a;
      padding-bottom: 8px;
    }
    
    .category-icon { width: 8px; height: 8px; background: #c41e3a; border-radius: 50%; margin-right: 10px; }
    .category-title { font-size: 18px; font-weight: 700; color: #c41e3a; }
    
    .category-articles { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
    
    .category-article {
      display: flex;
      gap: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #eee;
    }
    
    .category-article-image { width: 80px; height: 60px; object-fit: cover; flex-shrink: 0; }
    .category-article-title { font-size: 13px; font-weight: 600; line-height: 1.4; }
    .category-article-excerpt { font-size: 11px; color: #666; margin-top: 5px; }
    
    .sidebar { border-left: 1px solid #ddd; padding-left: 20px; }
    .sidebar-section { margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #eee; }
    .sidebar-title { font-size: 14px; font-weight: 700; background: #c41e3a; color: white; padding: 8px 12px; margin-bottom: 15px; }
    .sidebar-article { margin-bottom: 15px; padding-bottom: 12px; border-bottom: 1px solid #eee; }
    .sidebar-article:last-child { border-bottom: none; }
    .sidebar-article-title { font-size: 13px; font-weight: 600; line-height: 1.4; margin-bottom: 5px; }
    .sidebar-article-excerpt { font-size: 11px; color: #666; }
    
    .page-footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 2px solid #000;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #666;
    }
    
    .page-number { font-weight: 600; }
    
    .ad-space {
      background: #f5f5f5;
      border: 1px dashed #ccc;
      padding: 20px;
      text-align: center;
      color: #999;
      font-size: 12px;
      margin: 15px 0;
    }
    
    .no-image {
      background: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
      font-size: 10px;
    }
  </style>
</head>
<body>
  <!-- Page 1 - Front Page -->
  <div class="page">
    <header class="masthead">
      ${settings.logo ? `<img src="${settings.logo}" alt="${siteName}" class="masthead-logo">` : ''}
      <h1 class="masthead-title">${siteName}</h1>
      ${settings.site_description ? `<p class="masthead-tagline">${settings.site_description}</p>` : ''}
      <div class="masthead-info">
        <span>${formattedDate}</span>
        <span>পৃষ্ঠা ${toBengaliNumber(1)}</span>
        <span>সর্বস্বত্ব সংরক্ষিত</span>
      </div>
    </header>
    
    <div class="headlines-bar">
      ${articles.slice(0, 4).map(article => {
        const cat = categoryMap.get(article.category_ids?.[0] || '');
        return `
          <div class="headline-item">
            <div class="headline-item-category">${cat?.name || 'সংবাদ'}</div>
            <div>${truncateText(article.title, 50)}</div>
          </div>
        `;
      }).join('')}
    </div>
    
    <div class="main-grid">
      <div class="main-content">
        ${topHeadline ? `
          <article class="top-headline">
            <h2 class="top-headline-title">${topHeadline.title}</h2>
            ${topHeadline.featured_image ? 
              `<img src="${topHeadline.featured_image}" alt="${topHeadline.title}" class="top-headline-image">` : 
              '<div class="top-headline-image no-image">ছবি নেই</div>'
            }
            <div class="top-headline-content">
              ${truncateText(stripHtml(topHeadline.content || topHeadline.excerpt || ''), 800)}
            </div>
          </article>
        ` : ''}
        
        <div class="secondary-articles">
          ${secondaryArticles.map(article => `
            <article class="secondary-article">
              ${article.featured_image ? 
                `<img src="${article.featured_image}" alt="${article.title}" class="secondary-article-image">` : 
                '<div class="secondary-article-image no-image">ছবি নেই</div>'
              }
              <h3 class="secondary-article-title">${article.title}</h3>
              <p class="secondary-article-excerpt">
                ${truncateText(stripHtml(article.content || article.excerpt || ''), 150)}
              </p>
            </article>
          `).join('')}
        </div>
      </div>
      
      <aside class="sidebar">
        <div class="sidebar-section">
          <div class="sidebar-title">আরও সংবাদ</div>
          ${remainingArticles.slice(0, 5).map(article => `
            <div class="sidebar-article">
              <h4 class="sidebar-article-title">${article.title}</h4>
              <p class="sidebar-article-excerpt">
                ${truncateText(stripHtml(article.content || article.excerpt || ''), 80)}
              </p>
            </div>
          `).join('')}
        </div>
        <div class="ad-space">বিজ্ঞাপনের স্থান</div>
      </aside>
    </div>
    
    <footer class="page-footer">
      <span>${siteName}</span>
      <span class="page-number">পৃষ্ঠা ${toBengaliNumber(1)}</span>
      <span>${formattedDate}</span>
    </footer>
  </div>
  
  <!-- Additional Pages for Category Sections -->
  ${Object.entries(articlesByCategory).slice(0, 4).map(([catId, catArticles], pageIndex) => {
    const category = categoryMap.get(catId);
    const pageCatArticles = catArticles.slice(0, 8);
    
    return `
      <div class="page">
        <header class="masthead" style="padding-bottom: 10px; margin-bottom: 15px;">
          <h1 class="masthead-title" style="font-size: 32px;">${siteName}</h1>
          <div class="masthead-info">
            <span>${formattedDate}</span>
            <span>${category?.name || 'বিবিধ'}</span>
            <span>পৃষ্ঠা ${toBengaliNumber(pageIndex + 2)}</span>
          </div>
        </header>
        
        <div class="category-section">
          <div class="category-header">
            <div class="category-icon"></div>
            <h2 class="category-title">${category?.name || 'বিবিধ সংবাদ'}</h2>
          </div>
          
          ${pageCatArticles[0] ? `
            <article class="top-headline" style="margin-bottom: 20px;">
              <h2 class="top-headline-title" style="font-size: 24px;">${pageCatArticles[0].title}</h2>
              ${pageCatArticles[0].featured_image ? 
                `<img src="${pageCatArticles[0].featured_image}" alt="${pageCatArticles[0].title}" class="top-headline-image" style="height: 200px;">` : 
                '<div class="top-headline-image no-image" style="height: 200px;">ছবি নেই</div>'
              }
              <div class="top-headline-content" style="column-count: 2;">
                ${truncateText(stripHtml(pageCatArticles[0].content || pageCatArticles[0].excerpt || ''), 600)}
              </div>
            </article>
          ` : ''}
          
          <div class="category-articles">
            ${pageCatArticles.slice(1).map(article => `
              <article class="category-article">
                ${article.featured_image ? 
                  `<img src="${article.featured_image}" alt="${article.title}" class="category-article-image">` : 
                  '<div class="category-article-image no-image">ছবি</div>'
                }
                <div>
                  <h3 class="category-article-title">${article.title}</h3>
                  <p class="category-article-excerpt">
                    ${truncateText(stripHtml(article.content || article.excerpt || ''), 100)}
                  </p>
                </div>
              </article>
            `).join('')}
          </div>
        </div>
        
        <div class="ad-space">বিজ্ঞাপনের স্থান</div>
        
        <footer class="page-footer">
          <span>${siteName}</span>
          <span class="page-number">পৃষ্ঠা ${toBengaliNumber(pageIndex + 2)}</span>
          <span>${formattedDate}</span>
        </footer>
      </div>
    `;
  }).join('')}
</body>
</html>`;

  return html;
}

export { formatBengaliDate, toBengaliNumber, stripHtml, truncateText };
