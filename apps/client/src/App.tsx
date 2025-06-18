import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { socket, getState } from "./socket";
import { setState, setLoading, RootState } from "./store";

export default function App() {
  const counters = useSelector((state: RootState) => state.counters);
  const loading = useSelector((state: RootState) => state.loading);
  const error = useSelector((state: RootState) => state.error);
  const dispatch = useDispatch();

  useEffect(() => {
    getState().then((state) => dispatch(setState(state)));
    socket.on("state_updated", (newState) => {
      dispatch(setState(newState));
    });
    return () => {
      socket.off("state_updated");
    };
  }, [dispatch]);

  const handleAddCounter = () => {
    const newCounterName = prompt("Enter counter name:");
    if (newCounterName) {
      dispatch(setLoading(true));
      socket.emit("addCounter", newCounterName);
    }
  }

  const handleRemoveCounter = (index: number) => {
    dispatch(setLoading(true));
    socket.emit("removeCounter", index);
  };

  const handleIncrementCounter = (index: number) => {
    dispatch(setLoading(true));
    socket.emit("incrementCounter", index);
  };

  const handleDecrementCounter = (index: number) => {
    dispatch(setLoading(true));
    socket.emit("decrementCounter", index);
  };

  const handleResetCounter = (index: number) => {
    dispatch(setLoading(true));
    socket.emit("resetCounter", index);
  };

  const handleRenameCounter = (index: number) => {
    const currentName = counters[index]?.name;
    if (!currentName) return;

    const newName = prompt("Enter new name for the counter:", currentName);
    if (newName) {
      dispatch(setLoading(true));
      socket.emit("renameCounter", { index, newName });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Counters</h1>
      <button
        onClick={handleAddCounter}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Add Counter
      </button>
      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex flex-col items-center w-full max-w-2xl">
        {counters?.map((counter, index) => (
          <CounterComponent
            key={index}
            index={index}
            name={counter.name}
            value={counter.value}
            onIncrement={() => handleIncrementCounter(index)}
            onDecrement={() => handleDecrementCounter(index)}
            onReset={() => handleResetCounter(index)}
            onRename={() => handleRenameCounter(index)}
            onRemove={() => handleRemoveCounter(index)}
          />
        ))}
      </div>
    </div>
  );
}

export function CounterComponent(props: {
  index: number;
  name: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onReset: () => void;
  onRename: () => void;
  onRemove: () => void;
}) {
  const { index, name, value, onIncrement, onDecrement, onReset, onRename, onRemove } = props;

  return (
    <div className="bg-white p-4 rounded shadow mb-4 w-full max-w-md">
      <h2 className="text-xl font-semibold mb-2">{name}</h2>
      <p className="text-lg mb-4">Value: {value}</p>
      <div className="flex space-x-2">
        <button onClick={onIncrement} className="bg-blue-500 text-white px-4 py-2 rounded">Increment</button>
        <button onClick={onDecrement} className="bg-yellow-500 text-white px-4 py-2 rounded">Decrement</button>
        <button onClick={onReset} className="bg-green-500 text-white px-4 py-2 rounded">Reset</button>
        <button onClick={onRename} className="bg-purple-500 text-white px-4 py-2 rounded">Rename</button>
        <button onClick={onRemove} className="bg-red-500 text-white px-4 py-2 rounded">Remove</button>
      </div>
    </div>
  );
}
