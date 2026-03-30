import Fuse from 'fuse.js';

/**
 * Finds the closest matching category from a list using fuzzy search.
 * @param {string} userInput - The category typed by the user (e.g., "technlgy")
 * @param {string[]} existingCategories - Array of existing categories in the database
 * @param {number} threshold - Minimum match score (0-1). Default: 0.6
 * @returns {string} - Either the matched category or the original userInput if no match found
 */
export function findClosestCategory(userInput, existingCategories, threshold = 0.6) {
  if (!userInput || !existingCategories || existingCategories.length === 0) {
    return userInput;
  }

  // Normalize input to lowercase for comparison
  const normalizedInput = userInput.toLowerCase().trim();

  // First, check for exact case-insensitive match
  const exactMatch = existingCategories.find(
    (cat) => cat.toLowerCase() === normalizedInput
  );
  if (exactMatch) {
    return exactMatch;
  }

  // Use Fuse.js for fuzzy matching
  const fuse = new Fuse(existingCategories, {
    keys: [],  // Search the entire string (not nested keys)
    threshold: 1 - threshold,  // Fuse uses distance (inverse of similarity)
    minMatchCharLength: 2,  // Minimum 2 characters to match
    distance: 100,  // Allow typos up to 100 characters apart
  });

  const results = fuse.search(normalizedInput);

  if (results.length > 0) {
    // Return the best match (highest score = first result in Fuse)
    return results[0].item;
  }

  // No close match found, return original input
  return userInput;
}

/**
 * Get all unique categories from a list of reviews.
 * @param {Array} reviews - Array of review objects with a 'category' field
 * @returns {string[]} - Array of unique categories (case-sensitive, as stored)
 */
export function getUniqueCategories(reviews) {
  const categorySet = new Set(reviews.map((r) => r.category).filter(Boolean));
  return Array.from(categorySet);
}
