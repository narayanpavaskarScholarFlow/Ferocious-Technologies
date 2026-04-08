'use server';
/**
 * @fileOverview AI Intelligent CAD Quoting flow with Operation Color Identification.
 *
 * - quoteAnalysis - Analyzes part metadata and operations to suggest material, costs, and identifies operation colors.
 * - QuoteAnalysisInput - The input type for the quoteAnalysis function.
 * - QuoteAnalysisOutput - The return type for the quoteAnalysis function.
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
    length: z.number().describe('Recommended raw material length in mm'),
    width: z.number().describe('Recommended raw material width in mm'),
    height: z.number().describe('Recommended raw material height in mm'),
    materialType: z.string().describe('Suggested material type based on description'),
  }),
  estimations: z.array(z.object({
    operationName: z.string(),
    estimatedHours: z.number().describe('Estimated machining time in hours'),
    cost: z.number().describe('Calculated cost for this operation'),
    identifiedColor: z.string().optional().describe('The color associated with this operation in the CAD model (e.g., "Blue", "Red", "Cyan").'),
    hexColor: z.string().optional().describe('A CSS-friendly hex code for the identified color.'),
  })),
  totalMachiningCost: z.number().describe('The sum of all estimated operation costs.'),
  totalLeadTime: z.number().describe('Total estimated hours including buffers.'),
  leadTimeWithBuffer: z.number().describe('Total hours + 2 hours extra buffer as requested.'),
  complexityScore: z.string().describe('Part complexity rating (Low, Medium, High)'),
});
export type QuoteAnalysisOutput = z.infer<typeof QuoteAnalysisOutputSchema>;

const analyzeQuotePrompt = ai.definePrompt({
  name: 'analyzeQuotePrompt',
  input: {schema: QuoteAnalysisInputSchema},
  output: {schema: QuoteAnalysisOutputSchema},
  prompt: `You are a precision industrial quoting agent for Bharat Axis Pvt Ltd. 
Your task is to analyze a machining part based on its name and description to provide a professional cost and lead-time estimation.

Part Identity: {{{partName}}}
Geometry & Color Description: {{{modelDescription}}}

Available Operational Nodes (Asset Telemetry):
{{#each operations}}
- {{name}} (Rate: \${{costPerHour}}/hr)
{{/each}}

Based on the provided description, please perform the following:
1. RAW MATERIAL: Estimate the bounding box dimensions (Length, Width, Height in mm) required to machine this part. Suggest a realistic material type (e.g., Aluminum 6061, P20 Steel, SS304).
2. OPERATIONS: For each provided operation, estimate the required machining hours based on part complexity.
3. COLOR MAPPING: Identify which operation likely corresponds to which color if color coding was mentioned in the description (e.g., "Blue faces are milling").
4. COSTS: Calculate cost = (Estimated Hours * Node Rate).
5. TOTALS: Sum all costs. 
6. TIMELINE: Sum all hours for "Total Lead Time".
7. BUFFER: Calculate "Lead Time With Buffer" as (Total Lead Time + 2 hours). This is a mandatory industrial protocol.
8. COMPLEXITY: Rate the part as "Low", "Medium", or "High" complexity.

If information is sparse, use your expert knowledge of CNC milling, turning, and EDM to provide the most realistic industry-standard values. Do not leave fields empty.

Important: Your output must be a valid JSON object matching the requested schema.`,
});

export async function quoteAnalysis(input: QuoteAnalysisInput): Promise<QuoteAnalysisOutput> {
  return quoteAnalysisFlow(input);
}

const quoteAnalysisFlow = ai.defineFlow(
  {
    name: 'quoteAnalysisFlow',
    inputSchema: QuoteAnalysisInputSchema,
    outputSchema: QuoteAnalysisOutputSchema,
  },
  async input => {
    try {
      const {output} = await analyzeQuotePrompt(input);
      if (!output) {
        throw new Error('AI Engine failed to generate a valid estimation. Please provide a more detailed model description.');
      }
      return output;
    } catch (err: any) {
      console.error('Genkit Flow Error:', err);
      throw new Error(err.message || 'AI sequence failed to process model metadata.');
    }
  }
);
