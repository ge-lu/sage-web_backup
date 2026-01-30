import React from 'react';

interface SectionTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <h3 
      className={`text-2xl font-bold font-heading text-gray-900 mb-4 ml-2 ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

export default SectionTitle;
