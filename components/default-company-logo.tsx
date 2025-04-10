import React from 'react';

interface DefaultCompanyLogoProps {
  company: string;
  size?: 'sm' | 'md' | 'lg';
}

export const DefaultCompanyLogo: React.FC<DefaultCompanyLogoProps> = ({ 
  company, 
  size = 'md' 
}) => {
  // Extract initials (1-2 characters)
  const initials = company
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  
  // Generate a consistent color based on company name
  const getColorFromString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return {
      background: `hsl(${hue}, 70%, 85%)`,
      text: `hsl(${hue}, 80%, 30%)`
    };
  };
  
  const colors = getColorFromString(company);
  
  // Size variants
  const sizes = {
    sm: {
      container: "h-10 w-10 rounded-md",
      text: "text-sm"
    },
    md: {
      container: "h-12 w-12 rounded-md",
      text: "text-lg"
    },
    lg: {
      container: "h-18 w-18 rounded-lg",
      text: "text-2xl"
    }
  };
  
  return (
    <div 
      className={`${sizes[size].container} flex items-center justify-center overflow-hidden`}
      style={{ backgroundColor: colors.background }}
    >
      <span 
        className={`${sizes[size].text} font-semibold`}
        style={{ color: colors.text }}
      >
        {initials}
      </span>
    </div>
  );
};