const OpenAI = require('openai');
require('dotenv').config();

// Initialize OpenAI only if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} else {
  console.warn('⚠️  OpenAI API key not found. Recipe image analysis will not be available.');
}

/**
 * Analyze a recipe image and determine the most appropriate season
 * @param {string} imageUrl - The URL or base64 data of the image to analyze
 * @returns {Promise<string>} - The detected season (spring, summer, fall, winter, or none)
 */
async function analyzeRecipeImageForSeason(imageUrl) {
  try {
    if (!openai) {
      throw new Error('OpenAI API is not configured. Please set OPENAI_API_KEY environment variable.');
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using gpt-4o-mini for cost efficiency
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this food/recipe image and determine which season it best represents based on the ingredients, colors, presentation, and typical seasonal associations.

Consider:
- Spring: Fresh greens, light colors, berries, asparagus, peas, fresh herbs
- Summer: Bright colors, tropical fruits, berries, tomatoes, corn, grilled items, refreshing drinks
- Fall: Warm colors, pumpkins, squash, apples, root vegetables, hearty dishes
- Winter: Comfort foods, citrus fruits, warm dishes, stews, darker colors

Return ONLY one of these exact words: spring, summer, fall, winter, or none (if no clear seasonal association).`
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 10,
    });

    const season = response.choices[0].message.content.trim().toLowerCase();

    // Validate the response
    const validSeasons = ['spring', 'summer', 'fall', 'winter', 'none'];
    if (validSeasons.includes(season)) {
      return season;
    } else {
      console.warn('Invalid season response from OpenAI:', season);
      return 'none';
    }
  } catch (error) {
    console.error('Error analyzing image with OpenAI:', error);
    throw error;
  }
}

module.exports = {
  analyzeRecipeImageForSeason,
};
