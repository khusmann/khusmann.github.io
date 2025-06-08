import React, { useState, useRef } from "react";

interface ShinyPortalProps {
  url: string;
  maxWidth?: string | number; // e.g. '800px' or 800
  height?: string | number; // e.g. '500px' or 500
}

const ShinyPortal: React.FC<ShinyPortalProps> = ({
  url,
  maxWidth = "36rem",
  height = 400,
}) => {
  const [started, setStarted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const handleViewSource = () => {
    window.open(`${url}/edit`, "_blank");
  };

  if (!url) {
    return <div style={{ color: "red" }}>Error: No URL provided.</div>;
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth,
        height: typeof height === "number" ? `${height}px` : height,
        margin: "0 auto", // <-- Center the component
        backgroundColor: "#f0f0f0",
        border: "1px solid #ccc",
        borderRadius: "4px",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {!started ? (
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
      ) : (
        <>
          {/* Top-right buttons */}
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              display: "flex",
              gap: "8px",
              zIndex: 2,
            }}
          >
            <button
              onClick={handleReload}
              style={{
                padding: "6px 12px",
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
              style={{
                padding: "6px 12px",
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

          {/* App iframe */}
          <iframe
            ref={iframeRef}
            src={url}
            title="Shiny App"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
          />
        </>
      )}
    </div>
  );
};

export default ShinyPortal;
