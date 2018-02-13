import React from 'react';
import ReactDOM from 'react-dom/server';
import { jsxFn } from './index';

export const value = ReactDOM.renderToString(
    <div>
        {jsxFn('s', 's')}
        {jsxFn('abc', 'cba')}
        {jsxFn('s', 'abc')}
        {jsxFn('abc', 's')}
    </div>
);