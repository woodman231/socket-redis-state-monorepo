import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { socket, getState } from "./socket";
import { setState, setLoading, RootState } from "./store";

export default function App() {
  const counter = useSelector((state: RootState) => state.counter);
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

  const handleIncrement = () => {
    dispatch(setLoading(true));
    socket.emit("increment_count");
  };

  const handleDecrement = () => {
    dispatch(setLoading(true));
    socket.emit("decrement_count");
  };

  const handleReset = () => {
    dispatch(setLoading(true));
    socket.emit("reset");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Counter: {counter}</h1>
      <div className="flex gap-4">
        <button
          onClick={handleIncrement}
          disabled={loading}
          className={`px-4 py-2 bg-green-500 text-white rounded shadow ${loading ? "opacity-50" : ""}`}
        >
          Increment
        </button>
        <button
          onClick={handleDecrement}
          disabled={loading}
          className={`px-4 py-2 bg-red-500 text-white rounded shadow ${loading ? "opacity-50" : ""}`}
        >
          Decrement
        </button>
        <button
          onClick={handleReset}
          disabled={loading}
          className={`px-4 py-2 bg-blue-500 text-white rounded shadow ${loading ? "opacity-50" : ""}`}
        >
          Reset
        </button>
      </div>
      {loading && <div className="mt-4 text-gray-700">Loading…</div>}
      {error && <div className="mt-4 text-red-500">{error}</div>}
      {(!loading && !error && counter === 0) && <div className="mt-4 text-gray-500">Counter is ready!</div>}
    </div>
  );
}