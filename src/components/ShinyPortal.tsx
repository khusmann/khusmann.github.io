import React, { useState, useRef } from "react";

interface ShinyPortalProps {
  url: string;
  maxWidth?: string | number;
  height?: string | number;
  preview?: string; // optional preview image URL
}

const ShinyPortal: React.FC<ShinyPortalProps> = ({
  url,
  maxWidth = "36rem",
  height = 450,
  preview,
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
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            color: "#fff",
            zIndex: 1,
          }}
        >
          {preview && (
            <img
              src={preview}
              alt="Preview"
              style={{
                position: "absolute",
                objectFit: "cover",
                filter: "brightness(0.4)", // darken image for contrast
                zIndex: 0,
                userSelect: "none",
                pointerEvents: "none",
              }}
            />
          )}
          <div style={{ padding: "1rem", width: "100%", zIndex: 1 }}>
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
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
              }}
            >
              Run App
            </button>
            <div
              style={{
                marginTop: "1rem",
                fontSize: "14px",
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                display: "inline-block",
                color: "#f0f0f0",
              }}
            >
              The app will run entirely in your browser using{" "}
              <a
                href="https://posit-dev.github.io/r-shinylive/"
                className="not-prose"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#aadfff", textDecoration: "underline" }}
              >
                ShinyLive
              </a>
              . It's a ~30MB runtime that may take a moment to load initially,
              but it'll be cached across the demos on this page.
            </div>
          </div>
        </div>
      ) : (
        <>
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
