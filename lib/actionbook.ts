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
