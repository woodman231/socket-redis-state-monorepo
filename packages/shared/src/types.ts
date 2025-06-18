export type Counter = {
  name: string;
  value: number;
}

export type ClientState = {
  counters: Counter[];
  error?: string;
};
