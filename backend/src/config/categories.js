/**
 * Game Configuration
 * 
 * Centralized configuration for game categories and settings.
 * This file serves as the single source of truth for category mappings
 * and game parameters used across the application.
 */

/**
 * Category mapping between OpenTDB API IDs and display names.
 * These categories are used for fetching questions from the API
 * and storing them in the database.
 * 
 * To add a new category:
 * 1. Find the OpenTDB category ID from: https://opentdb.com/api_category.php
 * 2. Add a new entry to this array
 * 3. Run the seed script to populate questions for the new category
 * 
 * @type {Array<{id: number, name: string}>}
 */
export const CATEGORY_MAP = [
  { id: 9, name: "General Knowledge" },
  { id: 17, name: "Science" },
  { id: 11, name: "Entertainment" },
  { id: 23, name: "History" },
  { id: 21, name: "Sports" },
];

/**
 * Number of questions per game match.
 * This constant determines how many questions are randomly selected
 * and assigned to each match when it's created.
 * Dont think this is used.
 * @type {number}
 */
export const QUESTIONS_PER_GAME = 5;
