import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { FAQItem } from './types.ts';

interface FAQSectionProps {
  items: FAQItem[];
}

export const FAQSection: React.FC<FAQSectionProps> = ({ items }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mt-10 pt-8 border-t-2 border-gray-100 pb-12">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 px-2">Frequently Asked Questions</h3>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="border-2 border-gray-200 rounded-2xl overflow-hidden bg-white">
            <button
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between p-5 text-left focus:outline-none focus:bg-gray-100 transition-colors bg-gray-50"
              aria-expanded={openIndex === index}
              aria-controls={`faq-answer-${index}`}
              aria-label={`FAQ: ${item.question}`}
            >
              <span className="font-bold text-gray-900 text-lg">{item.question}</span>
              {openIndex === index ? (
                <ChevronUp className="w-6 h-6 text-gray-900" strokeWidth={2.5} />
              ) : (
                <ChevronDown className="w-6 h-6 text-gray-600" strokeWidth={2.5} />
              )}
            </button>
            {openIndex === index && (
              <div 
                id={`faq-answer-${index}`}
                className="px-5 py-5 text-base text-gray-800 leading-relaxed bg-white"
              >
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
