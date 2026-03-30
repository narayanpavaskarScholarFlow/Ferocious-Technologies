'use server';
/**
 * @fileOverview An AI assistant that processes tool descriptions to intelligently suggest relevant categories and descriptive tags.
 *
 * - aiToolCategorization - A function that handles the AI tool categorization process.
 * - AIToolCategorizationInput - The input type for the aiToolCategorization function.
 * - AIToolCategorizationOutput - The return type for the aiToolCategorization function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIToolCategorizationInputSchema = z.object({
  description: z
    .string()
    .describe('A detailed description of the tool to be categorized.'),
});
export type AIToolCategorizationInput = z.infer<
  typeof AIToolCategorizationInputSchema
>;

const AIToolCategorizationOutputSchema = z.object({
  categories: z
    .array(z.string())
    .describe(
      'A list of suggested categories for the tool, based on its description.'
    ),
  tags: z
    .array(z.string())
    .describe(
      'A list of descriptive tags for the tool, based on its description.'
    ),
});
export type AIToolCategorizationOutput = z.infer<
  typeof AIToolCategorizationOutputSchema
>;

export async function aiToolCategorization(
  input: AIToolCategorizationInput
): Promise<AIToolCategorizationOutput> {
  return aiToolCategorizationFlow(input);
}

const categorizeToolPrompt = ai.definePrompt({
  name: 'categorizeToolPrompt',
  input: {schema: AIToolCategorizationInputSchema},
  output: {schema: AIToolCategorizationOutputSchema},
  prompt: `You are an expert tool cataloging assistant. Your task is to analyze the provided tool description and suggest relevant categories and descriptive tags for efficient organization and discoverability.

Tool Description: {{{description}}}

Please provide a list of categories and tags that best describe this tool. The categories should be broader classifications, while the tags should be more specific keywords.`,
});

const aiToolCategorizationFlow = ai.defineFlow(
  {
    name: 'aiToolCategorizationFlow',
    inputSchema: AIToolCategorizationInputSchema,
    outputSchema: AIToolCategorizationOutputSchema,
  },
  async input => {
    const {output} = await categorizeToolPrompt(input);
    return output!;
  }
);
