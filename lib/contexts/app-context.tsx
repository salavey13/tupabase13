"use client";

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { DbUser } from '@/types/event';
import useTelegram from '@/lib/hooks/useTelegram';
import { getTicketDetails, assignTicketToUser } from '@/lib/api/tickets';
import { getEventBySlug } from '@/lib/api/events';
import { toast } from 'sonner';

// Add initial params to state
interface AppState {
  user: DbUser | null;
  debugLogs: string[];
  initialParams: {
    ticket?: string;
    event?: string;
    ref?: string;
  };
}

type Action =
  | { type: 'SET_USER'; payload: DbUser }
  | { type: 'UPDATE_USER'; payload: Partial<DbUser> }
  | { type: 'SET_INITIAL_PARAMS'; payload: AppState['initialParams'] }
  | { type: 'ADD_DEBUG_LOG'; payload: string };

const initialState: AppState = {
  user: null,
  debugLogs: [],
  initialParams: {},
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'UPDATE_USER':
      return state.user ? { ...state, user: { ...state.user, ...action.payload } } : state;
    case 'SET_INITIAL_PARAMS':
      return { ...state, initialParams: action.payload };
    case 'ADD_DEBUG_LOG':
      return {
        ...state,
        debugLogs: [...state.debugLogs, `${new Date().toISOString()}: ${action.payload}`],
      };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
  isAuthenticated: boolean;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user: tgUser } = useTelegram();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isAuthenticated = Boolean(state.user);

  // Capture initial params on mount
  React.useEffect(() => {
    const params = {
      ticket: searchParams?.get('ticket') || undefined,
      event: searchParams?.get('event') || undefined,
      ref: searchParams?.get('ref') || undefined,
    };
    dispatch({ type: 'SET_INITIAL_PARAMS', payload: params });
  }, []);

  // Handle initial params after user is loaded
  React.useEffect(() => {
    async function handleInitialParams() {
      if (!state.user || !state.initialParams) return;

      const { ticket, event } = state.initialParams;

      try {
        if (ticket) {
          const ticketDetails = await getTicketDetails(ticket);
          if (!ticketDetails.is_sold) {
            await assignTicketToUser(ticket, state.user.user_id);
            toast.success('Ticket assigned successfully!');
            router.push(`/events/${ticketDetails.event_slug}`);
          }
        } else if (event) {
          const eventData = await getEventBySlug(event);
          if (eventData) {
            router.push(`/events/${eventData.slug}`);
          }
        }
      } catch (error) {
        console.error('Error handling initial params:', error);
        toast.error('Failed to process ticket/event');
      }
    }

    handleInitialParams();
  }, [state.user, state.initialParams, router]);

  // Rest of your existing context code...
  // (fetchUser, insertNewUser, handleReferral functions remain the same)

  return (
    <AppContext.Provider value={{ state, dispatch, isAuthenticated }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}