'use client';

import React from 'react';

export function DropdownMenu({ children, ...props }: any) {
  return <div {...props}>{children}</div>;
}

export function DropdownMenuTrigger({ children, ...props }: any) {
  return <div {...props}>{children}</div>;
}

export function DropdownMenuContent({ children, ...props }: any) {
  return <div {...props}>{children}</div>;
}

export function DropdownMenuItem({ children, ...props }: any) {
  return <div {...props}>{children}</div>;
}

export function DropdownMenuSeparator({ ...props }: any) {
  return <hr {...props} />;
}

export function DropdownMenuSub({ children, ...props }: any) {
  return <div {...props}>{children}</div>;
}

export function DropdownMenuSubContent({ children, ...props }: any) {
  return <div {...props}>{children}</div>;
}

export function DropdownMenuSubTrigger({ children, ...props }: any) {
  return <div {...props}>{children}</div>;
}
