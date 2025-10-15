// src/api/chatService.js
import axios from 'axios';

// Define the API endpoint.
const API_BASE_URL = 'https://finderai-backend.onrender.com';

/**
 * @typedef {object} HadithCitation
 * @property {string} thematic_title
 * @property {string} detailed_explanation_english
 * @property {string} original_english_text
 * @property {string} hadith_number
 * @property {string} book_title
 */

/**
 * @typedef {object} FinalHadithResponse
 * @property {string} main_summary_english
 * @property {HadithCitation[]} hadith_details
 * @property {string} final_conclusion_english
 */


/**
 * Sends the user query to the FastAPI backend's RAG endpoint.
 * @param {string} query The user's question.
 * @param {string} sessionId The unique identifier for the conversation session.
 * @returns {Promise<FinalHadithResponse>} The structured FinalHadithResponse object.
 */
export const fetchRAGResponse = async (query, sessionId) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/query`,
      { 
        query: query,
        session_id: sessionId // Now sending the session ID
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    return response.data;

  } catch (error) {
    if (axios.isAxiosError(error)) {
        console.error("API Call Error:", error.response?.data || error.message);
        throw new Error(`Failed to fetch response. Check if backend is running: ${error.message}`);
    }
    throw new Error('An unknown error occurred during API call.');
  }
};