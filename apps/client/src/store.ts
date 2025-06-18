import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ClientState } from "@monorepo/shared/src/types";

type ClientUIState = ClientState & { loading: boolean };
const initialState: ClientUIState = { counter: 0, loading: false };

const stateSlice = createSlice({
  name: "state",
  initialState,
  reducers: {
    setState(state, action: PayloadAction<ClientState>) {
      state.counter = action.payload.counter;
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