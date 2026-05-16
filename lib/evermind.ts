import { UserProfile, Grant, Delta } from '../types';

// Mock storage (in-memory for demo)
const mockProfiles = new Map<string, UserProfile>();
const mockGrants = new Map<string, Grant[]>();

export async function saveUserProfile(userId: string, profile: UserProfile): Promise<void> {
  console.log('EVERMIND: saveUserProfile', userId);
  mockProfiles.set(userId, profile);
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  console.log('EVERMIND: getUserProfile', userId);
  return mockProfiles.get(userId) || {
    name: 'Alex',
    visaStatus: 'H4',
    major: 'Statistics',
    location: 'Sunnyvale, California',
  };
}

export async function saveGrantSnapshot(userId: string, grants: Grant[]): Promise<void> {
  console.log('EVERMIND: saveGrantSnapshot', userId, grants.length, 'grants');
  mockGrants.set(userId, grants);
}

export async function getYesterdaySnapshot(userId: string): Promise<Grant[]> {
  console.log('EVERMIND: getYesterdaySnapshot', userId);
  return mockGrants.get(userId) || [];
}

export async function saveDeltas(userId: string, deltas: Delta[]): Promise<void> {
  console.log('EVERMIND: saveDeltas', userId, deltas.length, 'deltas');
}

// Namespace export for route handlers that import as: import { evermind } from '@/lib/evermind'
export const evermind = {
  saveUserProfile,
  getUserProfile,
  saveGrantSnapshot,
  getYesterdaySnapshot,
  saveDeltas,
};
