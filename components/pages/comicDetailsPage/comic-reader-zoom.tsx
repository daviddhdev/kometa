import { useState } from "react";

interface ZoomLensProps {
  imageUrl: string | null;
  isEnabled: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  imageRef: React.RefObject<HTMLImageElement | null>;
}

export const ZoomLens = ({
  imageUrl,
  isEnabled,
  containerRef,
  imageRef,
}: ZoomLensProps) => {
  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0,
    lensTop: 0,
  });
  const [showLens, setShowLens] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEnabled || !containerRef.current || !imageRef.current) return;

    const imageRect = imageRef.current.getBoundingClientRect();

    // Calculate position relative to the image
    const x = e.clientX - imageRect.left;
    const y = e.clientY - imageRect.top;

    // Calculate lens position with edge handling
    let lensTop = y;
    const edgeThreshold = imageRect.height * 0.15;
    if (y < edgeThreshold) {
      // Near top edge - gradually move lens down
      const progress = y / edgeThreshold;
      lensTop = edgeThreshold * (0.5 + progress * 0.5);
    } else if (y > imageRect.height - edgeThreshold) {
      // Near bottom edge - gradually move lens up
      const progress = (imageRect.height - y) / edgeThreshold;
      lensTop = imageRect.height - edgeThreshold * (0.5 + progress * 0.5);
    }

    setMousePosition({
      x,
      y,
      lensTop,
    });
    setShowLens(true);
  };

  const handleMouseLeave = () => {
    setShowLens(false);
  };

  if (!imageUrl) return null;

  return (
    <div
      ref={containerRef}
      className="h-full overflow-auto bg-black relative"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Comic page"
          className="max-w-full max-h-full object-contain"
        />
        {isEnabled && showLens && (
          <div
            className="absolute pointer-events-none border-2 border-white overflow-hidden"
            style={{
              width: "100%",
              height: "33.33%",
              left: 0,
              top: mousePosition.lensTop,
              transform: "translateY(-50%)",
              backgroundImage: `url(${imageUrl})`,
              backgroundPosition: `center -${
                mousePosition.y * 2 - window.innerHeight * 0.1665
              }px`,
              backgroundSize: `${(imageRef.current?.width || 0) * 2}px auto`,
              backgroundRepeat: "no-repeat",
              boxShadow:
                "0 0 0 7px rgba(255, 255, 255, 0.85), 0 0 7px 7px rgba(0, 0, 0, 0.25)",
              zIndex: 50,
              transition: "top 0.15s ease-out",
            }}
          />
        )}
      </div>
    </div>
  );
};
