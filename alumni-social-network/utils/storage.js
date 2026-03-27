import { supabase } from "../supabase.js";

const state = {
  session: null,
  currentUser: null,
  feed: null,
  profile: null,
  directory: null,
  messages: null,
  subscriptions: [],
  subscriptionsInitialized: false,
};

export function getState() {
  return state;
}

export function setState(nextState) {
  Object.assign(state, nextState);
}

export function subscribeChannel(channel) {
  state.subscriptions.push(channel);
}

export function clearSubscriptions() {
  state.subscriptions.forEach((channel) => {
    supabase.removeChannel(channel);
  });
  state.subscriptions = [];
  state.subscriptionsInitialized = false;
}
