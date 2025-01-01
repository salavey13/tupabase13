"use client";

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { DbEvent } from '@/types/event';

// Extended User Interface
interface User {
  id: number;
  telegram_id: number;
  username: string;
  full_name: string;
  avatar_url?: string;
  website?: string;
  status: 'free' | 'pro' | 'admin';
  role: 'attendee' | 'organizer' | 'admin';
  language_code: string;
  active_organizer_id?: string;
  metadata: Record<string, any>;
  description?: string;
  badges?: string[];
  created_at: string;
  updated_at: string;
}

interface AppState {
  user: User | null;
  events: DbEvent[];
  debugLogs: string[];
}

type Action =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_EVENTS'; payload: DbEvent[] }
  | { type: 'ADD_EVENT'; payload: DbEvent }
  | { type: 'UPDATE_EVENT'; payload: { slug: string; event: Partial<DbEvent> } }
  | { type: 'ADD_DEBUG_LOG'; payload: string };

const initialState: AppState = {
  user: null,
  events: [],
  debugLogs: [],
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    // User management
    case 'SET_USER':
      return { ...state, user: action.payload };

    case 'UPDATE_USER':
      return state.user
        ? { ...state, user: { ...state.user, ...action.payload } }
        : state;

    // Events management
    case 'SET_EVENTS':
      return { ...state, events: action.payload };

    case 'ADD_EVENT':
      return { ...state, events: [...state.events, action.payload] };

    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map((event) =>
          event.slug === action.payload.slug
            ? { ...event, ...action.payload.event }
            : event
        ),
      };

    // Debug logs
    case 'ADD_DEBUG_LOG':
      return {
        ...state,
        debugLogs: [
          ...state.debugLogs,
          `${new Date().toISOString()}: ${action.payload}`,
        ],
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
  const isAuthenticated = Boolean(state.user);

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
