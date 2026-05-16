import { UserProfile, Grant, Delta } from "../types";

// Mock storage (in-memory for demo)
const mockProfiles = new Map<string, UserProfile>();
const mockGrants = new Map<string, Grant[]>();

export async function saveUserProfile(userId: string, profile: UserProfile): Promise<void> {
  console.log("EVERMIND: saveUserProfile", userId);
  mockProfiles.set(userId, profile);
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  console.log("EVERMIND: getUserProfile", userId);
  return mockProfiles.get(userId) || {
    name: "Alex",
    visaStatus: "H4",
    major: "Statistics",
    location: "Sunnyvale, California",
  };
}

export async function saveGrantSnapshot(userId: string, grants: Grant[]): Promise<void> {
  console.log("EVERMIND: saveGrantSnapshot", userId, grants.length, "grants");
  mockGrants.set(userId, grants);
}

export async function getYesterdaySnapshot(userId: string): Promise<Grant[]> {
  console.log("EVERMIND: getYesterdaySnapshot", userId);
  // Mock yesterday's snapshot — includes Dream Fund (eligible), Bay Area STEM (eligible), Pell (ineligible)
  return [
    {
      id: "ca-dream-fund",
      name: "California Dream Fund",
      amount: "$8,500/year",
      deadline: "2026-08-15",
      status: "eligible",
      requirements: ["AB540 status", "California resident 3+ years"]
    },
    {
      id: "bay-area-stem",
      name: "Bay Area STEM Immigrant Scholarship",
      amount: "$5,000 one-time",
      deadline: "2026-09-01",
      status: "eligible",
      requirements: ["STEM major", "immigrant status"]
    },
    {
      id: "pell-grant",
      name: "Federal Pell Grant",
      amount: "$7,395 max",
      deadline: "2026-06-30",
      status: "ineligible",
      requirements: ["FAFSA completion"],
      reason: "H4 visa holders are ineligible."
    }
  ];
}

export function detectDeltas(yesterday: Grant[], today: Grant[]): Delta[] {
  console.log("EVERMIND: detectDeltas", yesterday.length, "→", today.length, "grants");
  const deltas: Delta[] = [];

  // Simulate Dream Fund turning ineligible
  const dreamFundYesterday = yesterday.find(g => g.id === "ca-dream-fund");
  const dreamFundToday = today.find(g => g.id === "ca-dream-fund");
  if (dreamFundYesterday && dreamFundToday && dreamFundYesterday.status !== dreamFundToday.status) {
    deltas.push({
      id: "ca-dream-fund",
      type: "status_change",
      from: dreamFundYesterday.status,
      to: dreamFundToday.status,
      reason: "New AB540 legislation now requires active EAD."
    });
  }

  // Simulate new grant
  const newGrants = today.filter(t => !yesterday.some(y => y.id === t.id));
  for (const g of newGrants) {
    deltas.push({
      id: g.id,
      type: "new_grant",
      from: null,
      to: g.status,
      reason: `Statistics major + Sunnyvale resident. 94% match score.`
    });
  }

  return deltas;
}
