'use client';

import React from 'react';

export function AlertDialog({ children, ...props }: any) {
  return <div {...props}>{children}</div>;
}

export function AlertDialogTrigger({ children, ...props }: any) {
  return <div {...props}>{children}</div>;
}

export function AlertDialogContent({ children, ...props }: any) {
  return <div {...props}>{children}</div>;
}

export function AlertDialogHeader({ children, ...props }: any) {
  return <div {...props}>{children}</div>;
}

export function AlertDialogTitle({ children, ...props }: any) {
  return <h2 {...props}>{children}</h2>;
}

export function AlertDialogDescription({ children, ...props }: any) {
  return <p {...props}>{children}</p>;
}

export function AlertDialogFooter({ children, ...props }: any) {
  return <div {...props}>{children}</div>;
}

export function AlertDialogAction({ children, ...props }: any) {
  return <button {...props}>{children}</button>;
}

export function AlertDialogCancel({ children, ...props }: any) {
  return <button {...props}>{children}</button>;
}

