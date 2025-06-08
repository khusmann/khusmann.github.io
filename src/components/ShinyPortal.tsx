import React, { useState, useRef } from "react";

interface ShinyPortalProps {
  url: string;
  maxWidth?: string | number; // e.g. '800px' or 800
  height?: string | number; // e.g. '500px' or 500
}

const ShinyPortal: React.FC<ShinyPortalProps> = ({
  url,
  maxWidth = "36rem",
  height = 450,
}) => {
  const [started, setStarted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const handleViewSource = () => {
    window.open(`${url}?_shinylive-mode=editor-terminal-viewer`, "_blank");
  };

  if (!url) {
    return <div style={{ color: "red" }}>Error: No URL provided.</div>;
  }

  const resolvedMaxWidth =
    typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth;
  const resolvedHeight = typeof height === "number" ? `${height}px` : height;

  const headerHeight = 40;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: resolvedMaxWidth,
        height: resolvedHeight,
        margin: "0 auto",
        backgroundColor: "#f0f0f0",
        border: "1px solid #ccc",
        borderRadius: "4px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {!started ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => setStarted(true)}
            style={{
              padding: "12px 24px",
              fontSize: "16px",
              borderRadius: "4px",
              border: "none",
              backgroundColor: "#007bff",
              color: "white",
              cursor: "pointer",
            }}
          >
            Run App
          </button>
        </div>
      ) : (
        <>
          {/* Fixed header with text buttons */}
          <div
            style={{
              height: headerHeight,
              width: "100%",
              backgroundColor: "#e9ecef",
              borderBottom: "1px solid #ccc",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              padding: "0px 10px",
              gap: 8,
              boxSizing: "border-box",
              flexShrink: 0,
            }}
          >
            <button
              onClick={handleReload}
              title="Reload App"
              style={{
                padding: "3px 12px",
                fontSize: "14px",
                borderRadius: "4px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              Reload App
            </button>
            <button
              onClick={handleViewSource}
              title="View Source"
              style={{
                padding: "3px 12px",
                fontSize: "14px",
                borderRadius: "4px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              View Source
            </button>
          </div>

          {/* iframe fills the remaining space */}
          <iframe
            ref={iframeRef}
            src={url}
            title="Shiny App"
            style={{
              width: "100%",
              height: `calc(100% - ${headerHeight}px)`,
              border: "none",
              flexGrow: 1,
            }}
          />
        </>
      )}
    </div>
  );
};

export default ShinyPortal;
