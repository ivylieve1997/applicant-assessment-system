import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Applicant Atlas | Assessment Integrator', description: 'Combine source résumé assessments and reviewed personality results without rescoring.' };
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
