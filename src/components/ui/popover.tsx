'use client';

import React from 'react';

export function Popover({ children, ...props }: any) {
  return <div {...props}>{children}</div>;
}

export function PopoverTrigger({ children, ...props }: any) {
  return <div {...props}>{children}</div>;
}

export function PopoverContent({ children, ...props }: any) {
  return <div {...props}>{children}</div>;
}

