'use client' 
import { Suspense } from 'react';
export default function Custom404() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
          <div>Oops! Page not found.</div>;
        </Suspense>
      );
    }