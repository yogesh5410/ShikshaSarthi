import React, { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';

interface DatabaseInteractiveDemoProps {
  html: string;
  css: string;
  javascript: string;
}

const DatabaseInteractiveDemo: React.FC<DatabaseInteractiveDemoProps> = ({
  html,
  css,
  javascript
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const styleIdRef = useRef<string>(`demo-style-${Math.random().toString(36).substr(2, 9)}`);
  const scriptIdRef = useRef<string>(`demo-script-${Math.random().toString(36).substr(2, 9)}`);
  const cleanupExecutedRef = useRef(false);

  // Debug: Log what we receive
  console.log('📦 DatabaseInteractiveDemo received:', {
    htmlLength: html?.length || 0,
    cssLength: css?.length || 0,
    jsLength: javascript?.length || 0
  });

  useEffect(() => {
    if (!containerRef.current || !html || !javascript) {
      console.warn('⚠️ Missing demo data or container');
      return;
    }

    console.log('🎨 Loading interactive demo...');

    // Inject CSS with unique ID
    if (css) {
      const styleElement = document.createElement('style');
      styleElement.textContent = css;
      styleElement.id = styleIdRef.current;
      document.head.appendChild(styleElement);
      console.log('✅ CSS injected');
    }

    // Wait for HTML to be rendered before injecting script
    const timeoutId = setTimeout(() => {
      // Execute JavaScript by injecting actual script tag
      // This allows onclick handlers to access the functions
      const scriptElement = document.createElement('script');
      scriptElement.id = scriptIdRef.current;
      scriptElement.type = 'text/javascript';
      
      // Inject the code directly without any wrapper
      // Functions declared with 'function' keyword will be global
      scriptElement.textContent = javascript;
      
      document.body.appendChild(scriptElement);
      console.log('✅ JavaScript injected and executed');
      
      // Verify functions are accessible
      setTimeout(() => {
        // @ts-ignore - Dynamic function check
        if (typeof window.startDemo !== 'undefined') {
          console.log('✅ Demo functions are globally accessible');
        } else {
          console.warn('⚠️ Functions might not be in global scope');
          // @ts-ignore
          console.log('Available functions:', Object.keys(window).filter(k => k.includes('Demo')));
        }
      }, 50);
    }, 150);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      
      if (cleanupExecutedRef.current) return;
      cleanupExecutedRef.current = true;
      
      console.log('🧹 Cleaning up demo...');
      
      // Remove the style element
      const styleEl = document.getElementById(styleIdRef.current);
      if (styleEl) {
        styleEl.remove();
      }
      
      // Remove the script element
      const scriptEl = document.getElementById(scriptIdRef.current);
      if (scriptEl) {
        scriptEl.remove();
      }
      
      cleanupExecutedRef.current = false;
    };
  }, [html, css, javascript]);

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden mb-6">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm font-semibold text-gray-700">इंटरैक्टिव डेमो</span>
        </div>
        <div 
          ref={containerRef}
          dangerouslySetInnerHTML={{ __html: html }}
          className="demo-content"
        />
      </div>
    </Card>
  );
};

export default DatabaseInteractiveDemo;
