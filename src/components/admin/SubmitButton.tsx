'use client';
import { useFormStatus } from 'react-dom';
import { ReactNode } from 'react';

export default function SubmitButton({ children, className = 'btn-primary' }: { children: ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className={`${className} disabled:opacity-50`}>{pending ? '…' : children}</button>;
}
