import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Api } from '@/lib/api';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  username: string;
  profileImage: string;
  team: string;
  subTeam: string | null;
  template: string;
  roles: {
    teamRole: string;
    userRole: string;
  };
  permissions: {
    teamPermission: number;
    userPermission: string[];
  };
  email_verified: boolean | null;
  createdAt: string;
}

interface TeamMembersState {
  members: TeamMember[];
  isLoading: boolean;
  error: string | null;
  fetchMembers: () => Promise<void>;
  setMembers: (members: TeamMember[]) => void;
  clearMembers: () => void;
}

export const useTeamMembersStore = create<TeamMembersState>()(
  persist(
    (set) => ({
      members: [],
      isLoading: false,
      error: null,
      fetchMembers: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await Api.get('teams/members');
          if (response?.data?.members) {
            set({ members: response.data.members, isLoading: false });
          } else {
            throw new Error('Invalid response format');
          }
        } catch (err) {
          console.error('Error fetching team members:', err);
          const message =
            err instanceof Error
              ? err.message
              : typeof err === 'string'
              ? err
              : 'Failed to fetch team members';
          set({ error: message, isLoading: false });
        }
      },
      setMembers: (members) => set({ members }),
      clearMembers: () => set({ members: [], error: null }),
    }),
    {
      name: 'team-members-storage',
      partialize: (state) => ({ members: state.members }),
    }
  )
);