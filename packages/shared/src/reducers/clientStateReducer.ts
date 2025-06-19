import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ClientState } from "@monorepo/shared/src/types";

function getInitialState(): ClientState {
    return {
        counters: [],
        error: undefined
    };
}

export const stateSlice = createSlice({
    name: "state",
    initialState: getInitialState(),
    reducers: {
        addCounter: (state, action: PayloadAction<string>) => {
            state.counters.push({
                name: action.payload,
                value: 0
            })
        },
        incrementCounter: (state, action: PayloadAction<number>) => {
            // The payload is the index of the counter to increment
            const counter = state.counters[action.payload];
            if (counter) {
                counter.value += 1;
                state.error = undefined;
            } else {
                state.error = "Counter not found";
            }
        },
        decrementCounter: (state, action: PayloadAction<number>) => {
            const counter = state.counters[action.payload];
            if (counter) {
                if (counter.value > 0) {
                    counter.value -= 1;
                    state.error = undefined;
                } else {
                    state.error = "Counter cannot go below zero";
                }
            } else {
                state.error = "Counter not found";
            }
        },
        resetCounter: (state, action: PayloadAction<number>) => {
            const counter = state.counters[action.payload];
            if (counter) {
                counter.value = 0;
                state.error = undefined;
            } else {
                state.error = "Counter not found";
            }
        },
        renameCounter: (state, action: PayloadAction<{ index: number, newName: string }>) => {
            const { index, newName } = action.payload;
            if (index >= 0 && index < state.counters.length) {
                state.counters[index].name = newName;
                state.error = undefined;
            } else {
                state.error = "Counter not found";
            }
        },
        removeCounter: (state, action: PayloadAction<number>) => {
            const index = action.payload;
            if (index >= 0 && index < state.counters.length) {
                state.counters.splice(index, 1);
                state.error = undefined;
            }
        },
    }
});

export const clientStateActionKeys = Object.keys(stateSlice.actions);
export type ClientStateActionKey = keyof typeof stateSlice.actions;

type ActionPayload<T> = T extends (payload: infer P) => any
  ? P
  : T extends () => any
    ? void
    : never;

export type ClientStateSocketEvents = {
  [K in keyof typeof stateSlice.actions]: (
    payload: ActionPayload<(typeof stateSlice.actions)[K]>
  ) => void;
};

export const CLIENT_REQUESTS: { [K in keyof typeof stateSlice.actions]: K } = clientStateActionKeys.reduce(
  (acc, key) => {
    acc[key] = key;
    return acc;
  },
  {} as any // TypeScript will infer the correct type from the annotation above
);

