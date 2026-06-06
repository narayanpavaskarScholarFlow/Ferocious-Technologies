
'use server';
/**
 * @fileOverview AI Intelligent CAD Quoting flow with Operation Color Identification and Industrial Cost Logic.
 *
 * - quoteAnalysis - Analyzes part metadata and operations to suggest material, costs, and identifies operation colors.
 * - QuoteAnalysisInput - The input type for the quoteAnalysis function.
 * - QuoteAnalysisResult - The return type for the quoteAnalysis function, including success/error states.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuoteAnalysisInputSchema = z.object({
  partName: z.string().describe('The name of the part to be quoted.'),
  modelDescription: z.string().describe('A description of the 3D model geometry, complexity, and any color-coded features.'),
  operations: z.array(z.object({
    name: z.string(),
    costPerHour: z.number()
  })).describe('List of machining operations and their respective hourly costs.'),
});
export type QuoteAnalysisInput = z.infer<typeof QuoteAnalysisInputSchema>;

const QuoteAnalysisOutputSchema = z.object({
  rawMaterial: z.object({
    length: z.number().describe('Recommended raw material length in mm (including 5-10mm safety margin)'),
    width: z.number().describe('Recommended raw material width in mm (including 5-10mm safety margin)'),
    height: z.number().describe('Recommended raw material height in mm (including 5-10mm safety margin)'),
    materialType: z.string().describe('Suggested material type based on description'),
  }),
  estimations: z.array(z.object({
    operationName: z.string(),
    setupHours: z.number().describe('Estimated setup time in hours (standard 0.5 - 1.5h)'),
    machiningHours: z.number().describe('Estimated actual machining time in hours'),
    totalOperationHours: z.number().describe('Sum of setup and machining hours'),
    cost: z.number().describe('Calculated cost for this operation (Total Hours * Rate)'),
    identifiedColor: z.string().optional().describe('The color associated with this operation in the CAD model.'),
    hexColor: z.string().optional().describe('A CSS-friendly hex code for the identified color.'),
  })),
  totalMachiningCost: z.number().describe('The sum of all estimated operation costs in ₹.'),
  totalLeadTime: z.number().describe('Total estimated production hours.'),
  leadTimeWithBuffer: z.number().describe('Total hours + 2 hours extra buffer as per industrial protocol.'),
  complexityScore: z.string().describe('Part complexity rating (Low, Medium, High)'),
});
export type QuoteAnalysisOutput = z.infer<typeof QuoteAnalysisOutputSchema>;

export type QuoteAnalysisResult = 
  | { success: true; data: QuoteAnalysisOutput }
  | { success: false; error: string };

const analyzeQuotePrompt = ai.definePrompt({
  name: 'analyzeQuotePrompt',
  input: {schema: QuoteAnalysisInputSchema},
  output: {schema: QuoteAnalysisOutputSchema},
  prompt: `You are a precision industrial quoting agent for Ferocious Tech, an expert in CNC VMC and Tool Room operations.
Your task is to analyze a machining part to provide a professional, realistic cost and lead-time estimation in Indian Rupees (₹).

Part Identity: {{{partName}}}
Geometry & Color Description: {{{modelDescription}}}

Available Operational Nodes (Rates in ₹/hr):
{{#each operations}}
- {{name}} (Rate: ₹{{costPerHour}}/hr)
{{/each}}

Strict Industrial Protocol:
1. RAW MATERIAL: Estimate the bounding box dimensions. If description is vague, assume a standard block of 100x100x50mm as a baseline. Add 5-10mm safety margin.
2. OPERATIONS: Estimate realistic hours for EVERY provided operation.
   - Setup Time: 0.5h to 1.5h depending on description.
   - Machining Time: Based on complexity.
3. COLOR MAPPING: If colors are mentioned, map them to operations.
4. COSTS: cost = (Setup + Machining) * Rate.
5. BUFFER: Always add exactly 2 hours to the final lead time.

If the input description is very minimal (e.g., "Calculate price"), assume a "Standard Precision Component" with "Medium Complexity" and provide a realistic industrial estimation based on those assumptions.

Important: Output must be valid JSON matching the schema. All currency is ₹.`,
});

export async function quoteAnalysis(input: QuoteAnalysisInput): Promise<QuoteAnalysisResult> {
  try {
    const data = await quoteAnalysisFlow(input);
    return { success: true, data };
  } catch (err: any) {
    console.error('Quote Analysis Flow Error:', err);
    return { 
      success: false, 
      error: err.message || 'The AI Engine failed to process the request. Please verify inputs.' 
    };
  }
}

const quoteAnalysisFlow = ai.defineFlow(
  {
    name: 'quoteAnalysisFlow',
    inputSchema: QuoteAnalysisInputSchema,
    outputSchema: QuoteAnalysisOutputSchema,
  },
  async input => {
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const {output} = await analyzeQuotePrompt(input);
        if (!output) {
          throw new Error('AI Engine returned an empty response.');
        }
        return output;
      } catch (err: any) {
        attempts++;
        const isTransient = err.message?.includes('503') || 
                          err.message?.includes('unavailable') || 
                          err.message?.includes('429');

        if (isTransient && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000 * attempts));
          continue;
        }
        throw err;
      }
    }
    throw new Error('Analysis sequence timed out after multiple retry attempts.');
  }
);
