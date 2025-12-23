export interface Landmarks {
  x: number;
  y: number;
  z: number;
}

export const detectPinch = (landmarks: Landmarks[]): boolean => {
  if (!landmarks || landmarks.length < 21) return false;

  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];

  const distance = Math.sqrt(
    Math.pow(thumbTip.x - indexTip.x, 2) +
    Math.pow(thumbTip.y - indexTip.y, 2) +
    Math.pow(thumbTip.z - indexTip.z, 2)
  );

  return distance < 0.05;
};

export const detectThumbsUp = (landmarks: Landmarks[]): boolean => {
  if (!landmarks || landmarks.length < 21) return false;

  const thumbTip = landmarks[4];
  const thumbIP = landmarks[3];
  const indexMCP = landmarks[5];
  const middleMCP = landmarks[9];
  const ringMCP = landmarks[13];
  const pinkyMCP = landmarks[17];

  const thumbUp = thumbTip.y < thumbIP.y;
  const fingersDown =
    landmarks[8].y > indexMCP.y &&
    landmarks[12].y > middleMCP.y &&
    landmarks[16].y > ringMCP.y &&
    landmarks[20].y > pinkyMCP.y;

  return thumbUp && fingersDown;
};

export const detectPeaceSign = (landmarks: Landmarks[]): boolean => {
  if (!landmarks || landmarks.length < 21) return false;

  const indexTip = landmarks[8];
  const indexMCP = landmarks[5];
  const middleTip = landmarks[12];
  const middleMCP = landmarks[9];
  const ringMCP = landmarks[13];
  const pinkyMCP = landmarks[17];

  const indexUp = indexTip.y < indexMCP.y;
  const middleUp = middleTip.y < middleMCP.y;
  const ringDown = landmarks[16].y > ringMCP.y;
  const pinkyDown = landmarks[20].y > pinkyMCP.y;

  return indexUp && middleUp && ringDown && pinkyDown;
};
