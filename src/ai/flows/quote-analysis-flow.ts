'use server';
/**
 * @fileOverview AI Intelligent CAD Quoting flow with Operation Color Identification and Industrial Cost Logic.
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

const analyzeQuotePrompt = ai.definePrompt({
  name: 'analyzeQuotePrompt',
  input: {schema: QuoteAnalysisInputSchema},
  output: {schema: QuoteAnalysisOutputSchema},
  prompt: `You are a precision industrial quoting agent for Bharat Axis Pvt Ltd, an expert in CNC VMC and Tool Room operations.
Your task is to analyze a machining part to provide a professional, realistic cost and lead-time estimation in Indian Rupees (₹).

Part Identity: {{{partName}}}
Geometry & Color Description: {{{modelDescription}}}

Available Operational Nodes (Rates in ₹/hr):
{{#each operations}}
- {{name}} (Rate: ₹{{costPerHour}}/hr)
{{/each}}

Strict Industrial Protocol:
1. RAW MATERIAL: Estimate the bounding box dimensions based on the finished part description. Add 5-10mm safety margin to each dimension for stock selection.
2. OPERATIONS: For each provided operation, estimate realistic hours. 
   - Setup Time: 0.5h to 1.5h depending on complexity.
   - Machining Time: Based on material removal and feature complexity (e.g., deep pockets, precise bores).
3. COLOR MAPPING: Map colors mentioned (e.g., "Blue is milling") to the specific operation rows.
4. COSTS: Calculate cost = (Setup Hours + Machining Hours) * Node Hourly Rate.
5. TOTALS: Total Machining Cost = Sum of all individual operation costs.
6. TIMELINE: Sum all total operation hours for "Total Lead Time".
7. BUFFER: "Lead Time With Buffer" = (Total Lead Time + 2 hours).

Use your expert knowledge of Indian tool room standards to ensure the cost is neither too low (loss-making) nor too high (non-competitive). 

Important: Output must be valid JSON matching the schema. All currency is ₹.`,
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
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const {output} = await analyzeQuotePrompt(input);
        if (!output) {
          throw new Error('AI Engine failed to generate a valid estimation.');
        }
        return output;
      } catch (err: any) {
        attempts++;
        const isTransient = err.message?.includes('503') || 
                          err.message?.includes('unavailable') || 
                          err.message?.includes('high demand') ||
                          err.message?.includes('429');

        if (isTransient && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000 * attempts));
          continue;
        }
        console.error('Genkit Flow Error:', err);
        if (isTransient) {
          throw new Error('The AI Engine is currently experiencing heavy traffic. Please retry in a moment.');
        }
        throw new Error(err.message || 'AI sequence failed to process model metadata.');
      }
    }
    throw new Error('AI analysis sequence timed out. Please check your inputs.');
  }
);
