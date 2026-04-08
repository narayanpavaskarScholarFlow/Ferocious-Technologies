'use server';
/**
 * @fileOverview AI Intelligent CAD Quoting flow.
 *
 * - quoteAnalysis - Analyzes part metadata and operations to suggest material and costs.
 * - QuoteAnalysisInput - The input type for the quoteAnalysis function.
 * - QuoteAnalysisOutput - The return type for the quoteAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuoteAnalysisInputSchema = z.object({
  partName: z.string().describe('The name of the part to be quoted.'),
  modelDescription: z.string().describe('A description of the 3D model geometry and complexity.'),
  operations: z.array(z.object({
    name: z.string(),
    costPerHour: z.number()
  })).describe('List of machining operations and their respective hourly costs.'),
});
export type QuoteAnalysisInput = z.infer<typeof QuoteAnalysisInputSchema>;

const QuoteAnalysisOutputSchema = z.object({
  rawMaterial: z.object({
    length: z.number().describe('Recommended raw material length in mm'),
    width: z.number().describe('Recommended raw material width in mm'),
    height: z.number().describe('Recommended raw material height in mm'),
    materialType: z.string().describe('Suggested material type based on description'),
  }),
  estimations: z.array(z.object({
    operationName: z.string(),
    estimatedHours: z.number().describe('Estimated machining time in hours'),
    cost: z.number().describe('Calculated cost for this operation'),
  })),
  totalMachiningCost: z.number().describe('The sum of all estimated operation costs.'),
  totalLeadTime: z.number().describe('Total estimated hours including buffers.'),
  leadTimeWithBuffer: z.number().describe('Total hours + 2 hours extra buffer as requested.'),
  complexityScore: z.string().describe('Part complexity rating (Low, Medium, High)'),
});
export type QuoteAnalysisOutput = z.infer<typeof QuoteAnalysisOutputSchema>;

export async function quoteAnalysis(input: QuoteAnalysisInput): Promise<QuoteAnalysisOutput> {
  return quoteAnalysisFlow(input);
}

const analyzeQuotePrompt = ai.definePrompt({
  name: 'analyzeQuotePrompt',
  input: {schema: QuoteAnalysisInputSchema},
  output: {schema: QuoteAnalysisOutputSchema},
  prompt: `You are an expert industrial quoting engine for a precision tool room.
Analyze the following part and machining operations to provide a professional estimation for a quotation.

Part Name: {{{partName}}}
Model Description: {{{modelDescription}}}

Operations Matrix:
{{#each operations}}
- {{name}}: \${{costPerHour}}/hr
{{/each}}

Based on the complexity of the part described, please:
1. Estimate the raw material block size (LxWxH in mm) required to machine this part.
2. For each operation, estimate the required machining hours based on part complexity.
3. Calculate the cost for each operation (Hours * Cost per hour).
4. Provide the total machining cost.
5. Provide the total lead time in hours.
6. Provide the total lead time + exactly 2 hours of buffer.

Be realistic with industrial standards for CNC milling, turning, and EDM operations.`,
});

const quoteAnalysisFlow = ai.defineFlow(
  {
    name: 'quoteAnalysisFlow',
    inputSchema: QuoteAnalysisInputSchema,
    outputSchema: QuoteAnalysisOutputSchema,
  },
  async input => {
    const {output} = await analyzeQuotePrompt(input);
    return output!;
  }
);
