// @ts-check

/**
 * JSDoc doesn't have a direct equivalent for ambient module declarations like `declare module "*.html"`.
 * This is typically handled by a bundler's configuration (e.g., Vite, Webpack, or Bun).
 * However, you can define a type to represent the imported content for clarity.
 * @typedef {string} HtmlContent
 */

/**
 * @typedef {Object} RequestOptions
 * @property {string} [body] - The request body.
 * @property {Headers} [headers] - The request headers.
 * @property {"GET" | "POST"} method - The HTTP request method.
 */

/**
 * @typedef {Object} RequestResponse
 * @property {boolean} success - Indicates if the request was successful.
 * @property {string} response - The response payload.
 * @property {string} statusText - The status text of the response.
 */

/**
 * This type represents the final result obtained by scraping a whole page.
 * @typedef {Object} ParsedResult
 * @property {string | null} title - Title of the form (Headline/Form Title).
 * @property {string | null} description - Sub-title for the Google Form.
 * @property {ParsedQuestion[]} questions - Represents all questions present in the current page.
 */

/**
 * This represents each question format that we obtained from a form page.
 * @typedef {Object} ParsedQuestion
 * @property {string} title - The actual question or question title.
 * @property {any[] | null} moreInfo - Contains more items if this question included extra details, e.g., options with images, or if the question itself is an image.
 * @property {number} type - Represents the type of question.
 *   `SHORT_ANSWER`: 0,
 *   `PARAGRAPH`: 1,
 *   `MULTIPLE_CHOICE`: 2,
 *   `CHECKBOXES`: 4,
 *   `DROP_DOWN`: 3,
 *   `FILE_UPLOAD`: 13,
 *   `LINEAR_SCALE`: 5,
 *   `GRID_CHOICE`: 7,
 *   `DATE`: 9,
 *   `TIME`: 10
 * @property {number} id - A unique ID provided by Google Forms, useful for programmatic submission.
 * @property {boolean} required - If this question is mandatory.
 * @property {ParsedOption[]} options - The options provided for this question.
 */

/**
 * Represents a specific option for a question.
 * @typedef {Object} ParsedOption
 * @property {string} value - The value or text content of the option.
 * @property {any[] | null} moreInfo - Will be present if the option contained more information, like images.
 */

// Since these are just type definitions, there is no runnable code to export.
// You would typically use these JSDoc comments in the files where you handle
// objects of these shapes. For example:

/**
 * @param {ParsedQuestion} question
 */
function processQuestion(question) {
  console.log(`Processing question: ${question.title}`);
}
