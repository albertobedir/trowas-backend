import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Api } from '@/lib/api';

interface Team {
  _id: string;
  name: string;
  owner: string;
  members: string[];
  [key: string]: any;
}

interface TeamsState {
  teams: Record<string, Team>;
  isLoading: boolean;
  error: string | null;
  fetchTeam: (teamId: string, force?: boolean) => Promise<void>;
  setTeam: (team: Team) => void;
  clearTeam: (teamId: string) => void;
  clearAllTeams: () => void;
  updateTeam: (data: { [key: string]: any }) => Promise<void>;
}

export const useTeamStore = create<TeamsState>()(
  persist(
    (set, get) => ({
      teams: {},
      isLoading: false,
      error: null,

      fetchTeam: async (teamId: string, force: boolean = false) => {
        const existingTeam = get().teams[teamId];


        set({ isLoading: true, error: null });

        try {
          const response = await Api.get(`teams/${teamId}`);
          const team = response.data.team;

          set(state => ({
            teams: {
              ...state.teams,
              [teamId]: team,
            },
            isLoading: false,
          }));
        } catch (err: any) {
          console.error('Error fetching team:', err);
          set({
            error: err?.message || 'Failed to fetch team data',
            isLoading: false,
          });
        }
      },

      setTeam: (team: Team) =>
        set(state => ({
          teams: {
            ...state.teams,
            [team._id]: team,
          },
        })),

      clearTeam: (teamId: string) =>
        set(state => {
          const { [teamId]: _, ...remainingTeams } = state.teams;
          return { teams: remainingTeams };
        }),

      clearAllTeams: () => set({ teams: {}, error: null }),

      updateTeam: async (data: { [key: string]: any }) => {
        set({ isLoading: true, error: null });
        try {
          const response = await Api.patch('teams/update', data);
          const updatedTeam = response.data.team;
          
          set(state => ({
            teams: {
              ...state.teams,
              [updatedTeam._id]: updatedTeam,
            },
            isLoading: false,
          }));
        } catch (err: any) {
          console.error('Error updating team:', err);
          set({
            error: err?.message || 'Failed to update team',
            isLoading: false,
          });
          throw err;
        }
      },
    }),
    {
      name: 'team-storage',
      partialize: (state) => ({ teams: state.teams }),
    }
  )
);
