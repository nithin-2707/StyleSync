import type { ReactNode } from "react";

interface ThreePanelProps {
  rail: ReactNode;
  sidebar?: ReactNode;
  editor?: ReactNode;
  preview?: ReactNode;
}

export default function ThreePanel({ rail, sidebar, editor, preview }: ThreePanelProps) {
  // Determine grid template based on active columns
  let lgGridCols = "84px ";
  
  if (sidebar && editor && preview) {
    lgGridCols += "260px 430px minmax(0,1fr)";
  } else if (sidebar && editor) {
    lgGridCols += "260px minmax(0,1fr)";
  } else if (sidebar && preview) {
    lgGridCols += "260px minmax(0,1fr)";
  } else if (preview) {
    lgGridCols += "minmax(0,1fr)";
  } else if (editor) {
    lgGridCols += "minmax(0,1fr)";
  } else if (sidebar) {
    lgGridCols += "260px minmax(0,1fr)";
  } else {
    lgGridCols += "minmax(0,1fr)";
  }

  return (
    <div className="h-[calc(100vh-74px)] p-4 lg:px-5 lg:py-4">
      <div 
        className="grid h-full gap-4 transition-all duration-300 w-full"
        style={{
           gridTemplateColumns: "1fr",
        }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          @media (min-width: 1024px) {
            .dynamic-layout { grid-template-columns: ${lgGridCols} !important; }
          }
        `}} />
        <div className="dynamic-layout grid h-full gap-4 transition-all duration-300 w-full col-span-1" style={{ gridColumn: "1 / -1" }}>
          <div className="min-h-0 lg:sticky lg:top-[92px] lg:h-[calc(100vh-110px)] hidden lg:block">{rail}</div>
          {sidebar && <div className="min-h-0 lg:sticky lg:top-[92px] lg:h-[calc(100vh-110px)] hidden lg:block">{sidebar}</div>}
          {editor && <div className="min-h-0 lg:h-[calc(100vh-110px)] flex flex-col">{editor}</div>}
          {preview && <div className="min-h-0 lg:h-[calc(100vh-110px)] flex flex-col">{preview}</div>}
        </div>
      </div>
    </div>
  );
}
