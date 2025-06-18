import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ClientState } from "@monorepo/shared/src/types";

type ClientUIState = ClientState & { loading: boolean };
const initialState: ClientUIState = { counters: [], error: undefined, loading: false };

const stateSlice = createSlice({
  name: "state",
  initialState,
  reducers: {
    setState(state, action: PayloadAction<ClientState>) {
      state.counters = action.payload.counters;
      state.error = action.payload.error;
      state.loading = false;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    }
  },
});

export const { setState, setLoading } = stateSlice.actions;

export const store = configureStore({
  reducer: stateSlice.reducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;