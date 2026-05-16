import { Actionbook } from '@actionbookdev/sdk';

const actionbookClient = new Actionbook({
  apiKey: process.env.ACTIONBOOK_API_KEY || '',
});

export async function searchActions(query: string) {
  return await actionbookClient.searchActions(query);
}

export async function getActionByAreaId(id: string) {
  return await actionbookClient.getActionByAreaId(id);
}

// Export the tool definitions provided by the SDK so the LLM can use them
export const actionbookTools = [
  {
    type: 'function' as const,
    function: {
      name: 'searchActions',
      description: 'Search for a browser action manual in Actionbook to find the right action ID.',
      parameters: actionbookClient.searchActions.params.json,
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'getActionByAreaId',
      description: 'Get verified DOM selectors and details for a specific browser action ID.',
      parameters: actionbookClient.getActionByAreaId.params.json,
    },
  },
];

// Legacy stubbed interfaces for backward compatibility with the demo UI if needed
export interface FormResult {
  success: boolean;
  fieldsPrefilled: string[];
}

export async function navigateToGrantPortal(url: string): Promise<void> {
  console.log("ACTIONBOOK: navigateToGrantPortal", url);
}

export async function prefillApplicationForm(grantId: string, profile: any): Promise<FormResult> {
  console.log("ACTIONBOOK: prefillApplicationForm", grantId);
  return {
    success: true,
    fieldsPrefilled: ["name", "visaStatus", "major", "location"]
  };
}

export async function downloadApplicationPDF(grantId: string): Promise<string> {
  console.log("ACTIONBOOK: downloadApplicationPDF", grantId);
  return `/downloads/${grantId}-application.pdf`;
}
