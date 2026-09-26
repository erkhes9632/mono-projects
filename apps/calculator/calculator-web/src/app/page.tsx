'use client';

import { useState } from 'react';
import { sum } from './utils/sum';
import { minus } from './utils/minus';
import { multiply } from './utils/multiply';
import { divide } from './utils/divide';

export default function Index() {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [resetDisplay, setResetDisplay] = useState(false);

  const handleNumber = (num: string) => {
    if (resetDisplay || display === '0') {
      setDisplay(num);
      setResetDisplay(false);
    } else {
      setDisplay(display + num);
    }
  };

  const handleDecimal = () => {
    if (resetDisplay) {
      setDisplay('0.');
      setResetDisplay(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+':
        return sum(a, b);
      case '-':
        return minus(a, b);
      case '*':
        return multiply(a, b);
      case '/':
        return divide(a, b);
      default:
        return b;
    }
  };

  const handleOp = (op: string) => {
    const currentValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(currentValue);
    } else if (operation && !resetDisplay) {
      const result = calculate(prevValue, currentValue, operation);
      setPrevValue(result);
      setDisplay(String(result));
    }

    setOperation(op);
    setResetDisplay(true);
  };

  const handleEqual = () => {
    if (prevValue !== null && operation && !resetDisplay) {
      const currentValue = parseFloat(display);
      const result = calculate(prevValue, currentValue, operation);
      setDisplay(String(result));
      setPrevValue(null);
      setOperation(null);
      setResetDisplay(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperation(null);
    setResetDisplay(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 font-sans text-zinc-100 selection:bg-none antialiased">
      <div className="w-full max-w-[300px] rounded-[32px] border border-zinc-800/60 bg-zinc-950 p-5 shadow-2xl">
        <div className="mb-4 flex flex-col items-end justify-end px-3 py-6 h-28">
          <div className="h-4 text-xs font-medium text-zinc-500 tracking-wider">
            {prevValue !== null && `${prevValue} ${operation || ''}`}
          </div>
          <div className="max-w-full overflow-x-auto text-5xl font-extralight tracking-tight text-white scrollbar-none">
            {display}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={handleClear}
            className="col-span-3 rounded-full bg-zinc-900/80 p-4 text-xs font-semibold text-zinc-400 transition hover:bg-zinc-800 hover:text-white active:scale-95"
          >
            AC
          </button>
          <button
            onClick={() => handleOp('/')}
            className="rounded-full bg-zinc-900/80 p-4 text-sm font-semibold text-amber-500 transition hover:bg-amber-500 hover:text-black active:scale-95"
          >
            ÷
          </button>

          {['7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleNumber(num)}
              className="rounded-full bg-zinc-900/40 p-4 text-base font-normal text-zinc-200 transition hover:bg-zinc-800 active:scale-95"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleOp('*')}
            className="rounded-full bg-zinc-900/80 p-4 text-sm font-semibold text-amber-500 transition hover:bg-amber-500 hover:text-black active:scale-95"
          >
            ×
          </button>

          {['4', '5', '6'].map((num) => (
            <button
              key={num}
              onClick={() => handleNumber(num)}
              className="rounded-full bg-zinc-900/40 p-4 text-base font-normal text-zinc-200 transition hover:bg-zinc-800 active:scale-95"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleOp('-')}
            className="rounded-full bg-zinc-900/80 p-4 text-sm font-semibold text-amber-500 transition hover:bg-amber-500 hover:text-black active:scale-95"
          >
            −
          </button>

          {['1', '2', '3'].map((num) => (
            <button
              key={num}
              onClick={() => handleNumber(num)}
              className="rounded-full bg-zinc-900/40 p-4 text-base font-normal text-zinc-200 transition hover:bg-zinc-800 active:scale-95"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleOp('+')}
            className="rounded-full bg-zinc-900/80 p-4 text-sm font-semibold text-amber-500 transition hover:bg-amber-500 hover:text-black active:scale-95"
          >
            +
          </button>

          <button
            onClick={() => handleNumber('0')}
            className="col-span-2 rounded-full bg-zinc-900/40 p-4 text-base font-normal text-zinc-200 transition hover:bg-zinc-800 active:scale-95"
          >
            0
          </button>
          <button
            onClick={handleDecimal}
            className="rounded-full bg-zinc-900/40 p-4 text-base font-normal text-zinc-200 transition hover:bg-zinc-800 active:scale-95"
          >
            .
          </button>
          <button
            onClick={handleEqual}
            className="rounded-full bg-amber-500 p-4 text-sm font-semibold text-black transition hover:bg-amber-400 active:scale-95 shadow-lg shadow-amber-500/10"
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
}
