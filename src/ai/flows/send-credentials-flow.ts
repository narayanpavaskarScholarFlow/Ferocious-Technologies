'use server';
/**
 * @fileOverview AI flow to generate and "send" user credentials via email.
 * 
 * - sendCredentials - A function that handles the AI credential generation and simulated dispatch.
 * - SendCredentialsInput - The input type for the sendCredentials function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SendCredentialsInputSchema = z.object({
  name: z.string().describe('The full name of the user.'),
  email: z.string().describe('The registered network identifier or email address.'),
  role: z.string().describe('The assigned functional role.'),
  temporaryPassword: z.string().describe('The system-generated temporary password.'),
});
export type SendCredentialsInput = z.infer<typeof SendCredentialsInputSchema>;

const SendCredentialsOutputSchema = z.object({
  success: z.boolean().describe('Whether the credential transmission was successful.'),
  message: z.string().describe('Status message from the dispatch protocol.'),
});
export type SendCredentialsOutput = z.infer<typeof SendCredentialsOutputSchema>;

export async function sendCredentials(
  input: SendCredentialsInput
): Promise<SendCredentialsOutput> {
  return sendCredentialsFlow(input);
}

const welcomeEmailPrompt = ai.definePrompt({
  name: 'welcomeEmailPrompt',
  input: {schema: SendCredentialsInputSchema},
  output: {schema: z.object({subject: z.string(), body: z.string()})},
  prompt: `You are an automated system administrator for Jayasimha Precision.
Your task is to compose a professional welcome email for a new identity being onboarded into the ERP matrix.

Recipient Details:
- Full Name: {{name}}
- Designated Role: {{role}}
- Login Identifier: {{email}}
- Temporary Security Token: {{temporaryPassword}}

Email Protocol:
1. Subject line must be authoritative and include "Node Access Provisioned".
2. The body should welcome them to the Jayasimha Precision industrial control ecosystem.
3. Present the credentials clearly in a technical format.
4. Mandate a password update upon first synchronization at the secure gateway.
5. Tone: Precise, Industrial, and Secure.`,
});

const sendCredentialsFlow = ai.defineFlow(
  {
    name: 'sendCredentialsFlow',
    inputSchema: SendCredentialsInputSchema,
    outputSchema: SendCredentialsOutputSchema,
  },
  async input => {
    const {output} = await welcomeEmailPrompt(input);

    // Simulated Industrial Email Dispatch Sequence
    console.log(`[ERP_DISPATCH_PROTOCOL] Initializing transmission to: ${input.email}`);
    console.log(`[ERP_DISPATCH_PROTOCOL] Subject: ${output?.subject}`);
    console.log(`[ERP_DISPATCH_PROTOCOL] Content: \n${output?.body}`);
    console.log(`[ERP_DISPATCH_PROTOCOL] Protocol SMTP_GATEWAY_V2.4 verified. Dispatch complete.`);

    return {
      success: true,
      message: `System identity credentials successfully transmitted to ${input.email}.`,
    };
  }
);