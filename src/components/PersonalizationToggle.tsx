import { useState, forwardRef } from 'react';
import { Settings, Type as TextIcon, Globe } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PersonalizationToggle = () => {
  const [isPersonalized, setIsPersonalized] = useState(
    localStorage.getItem('isPersonalized') === 'true'
  );
  const [fontSize, setFontSize] = useState(
    localStorage.getItem('fontSize') || 'medium'
  );
  const [isOpen, setIsOpen] = useState(false);
  
  const handlePersonalizationToggle = () => {
    const newValue = !isPersonalized;
    setIsPersonalized(newValue);
    localStorage.setItem('isPersonalized', String(newValue));
    window.location.reload();
  };
  
  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    localStorage.setItem('fontSize', size);
    document.documentElement.className = `font-size-${size}`;
  };

  return (
    <TooltipProvider>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full bg-background shadow-md hover:bg-accent"
                aria-label="ব্যক্তিগতকরণ সেটিংস"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          {!isOpen && (
            <TooltipContent side="left">
              <p>ব্যক্তিগতকরণ সেটিংস</p>
            </TooltipContent>
          )}
        </Tooltip>
        <DropdownMenuContent align="end" className="w-56 bg-popover z-[100]">
          <DropdownMenuLabel>ব্যক্তিগতকরণ</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="flex items-center justify-between cursor-pointer"
            onSelect={(e) => e.preventDefault()}
          >
            <span>বিষয়বস্তু স্বনির্ধারণ</span>
            <Switch 
              checked={isPersonalized} 
              onCheckedChange={handlePersonalizationToggle} 
            />
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="flex items-center gap-2">
            <TextIcon className="h-4 w-4" /> ফন্টের আকার
          </DropdownMenuLabel>
          <DropdownMenuItem 
            className={`cursor-pointer ${fontSize === 'small' ? 'bg-primary/10' : ''}`}
            onClick={() => handleFontSizeChange('small')}
          >
            ছোট
          </DropdownMenuItem>
          <DropdownMenuItem 
            className={`cursor-pointer ${fontSize === 'medium' ? 'bg-primary/10' : ''}`}
            onClick={() => handleFontSizeChange('medium')}
          >
            মাঝারি
          </DropdownMenuItem>
          <DropdownMenuItem 
            className={`cursor-pointer ${fontSize === 'large' ? 'bg-primary/10' : ''}`}
            onClick={() => handleFontSizeChange('large')}
          >
            বড়
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="flex items-center gap-2">
            <Globe className="h-4 w-4" /> ভাষা
          </DropdownMenuLabel>
          <DropdownMenuItem className="cursor-pointer">বাংলা</DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">English</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
};

export default PersonalizationToggle;
