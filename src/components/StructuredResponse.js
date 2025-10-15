// src/components/StructuredResponse.jsx
import React from 'react';

/**
 * @typedef {import('../api/chatService').FinalHadithResponse} FinalHadithResponse
 * @typedef {import('../api/chatService').HadithCitation} HadithCitation
 */

/**
 * @param {object} props
 * @param {import('../api/chatService').FinalHadithResponse} props.data
 */
const StructuredResponse = ({ data }) => {

  if (!data || !data.hadith_details || data.hadith_details.length === 0) {
    return <div className="text-red-600 italic">No structured data found for this query.</div>;
  }

  /**
   * Helper component to render a single Hadith citation block.
   * @param {object} props
   * @param {import('../api/chatService').HadithCitation} props.detail
   * @param {number} props.index
   */
  const HadithDetail = ({ detail, index }) => (
    <div 
      className="hadith-detail mt-5 pt-3 border-t border-gray-200"
    >
      {/* Thematic Title - Use a clear color against white background */}
      <h3 className="text-xl font-bold text-indigo-700 mb-2">
        [{index + 1}] {detail.thematic_title}
      </h3>
      
      {/* Detailed Explanation - Standard text color */}
      <p className="text-gray-700 italic mb-3">{detail.detailed_explanation_english}</p>
      
      {/* 1. Arabic Text Display */}
      <div className="my-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
        <strong className="block mb-1 text-gray-800 font-semibold">Original Text (Arabic):</strong>
        <p 
          className="text-xl text-gray-900"
          style={{
            textAlign: 'right',
            direction: 'rtl',
            lineHeight: '1.8',
          }}
        >
          {detail.original_arabic_text}
        </p>
      </div>

      {/* 2. English Translation Block */}
      <div className="mt-3 p-3 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700">
        <strong className="block mb-1 font-semibold">English Translation:</strong>
        <pre className="whitespace-pre-wrap font-mono m-0 p-0 text-xs text-gray-700">
          {detail.original_english_text}
        </pre>
      </div>
      
      {/* Citation */}
      <p className="mt-3 text-sm font-medium text-gray-500">
        <strong className="text-indigo-600">Source:</strong> Hadith No. {detail.hadith_number} ({detail.book_title})
      </p>
    </div>
  );


  return (
    <div className="w-full"> 
      
      {/* Main Summary */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Summary</h2>
        <p className="text-lg text-gray-700">{data.main_summary_english}</p>
      </div>

      {/* Hadith Details */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">Citations and Explanations:</h2>
      {data.hadith_details.map((detail, index) => (
        <HadithDetail key={index} detail={detail} index={index} />
      ))}

      {/* Final Conclusion */}
      <div className="mt-6 pt-4 border-t-2 border-green-500">
        <h2 className="text-2xl font-bold text-green-700 mb-2">💡 Final Conclusion</h2>
        <p className="text-lg text-green-900">{data.final_conclusion_english}</p>
      </div>
    </div>
  );
};

export default StructuredResponse;