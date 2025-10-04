import React from 'react';

const VideoPlayer = ({ isVideoMaximized, setIsVideoMaximized, theme }) => {
  const styles = {
    videoContainer: {
      position: 'fixed',
      zIndex: 1000,
      transition: 'all 0.3s ease',
      borderRadius: '12px',
      overflow: 'hidden',
      background: theme.surface,
      border: '1px solid ' + theme.border,
      cursor: 'pointer'
    },
    videoMinimized: {
      bottom: '17px',
      left: '17px',
      width: '170px',
      height: '100px'
    },
    videoMaximized: {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '50vw',
      height: '50vh',
      zIndex: 2000,
      boxShadow: '0 0 20px 8px rgba(0, 0, 0, 0.5)',
      border: '2px solid ' + theme.accent
    },
    video: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  };

  return (
    <div
      style={{
        ...styles.videoContainer,
        ...(isVideoMaximized ? styles.videoMaximized : styles.videoMinimized)
      }}
      onClick={() => setIsVideoMaximized((prev) => !prev)}
    >
      <video style={styles.video} autoPlay loop muted playsInline>
        <source src="./assets/video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;


