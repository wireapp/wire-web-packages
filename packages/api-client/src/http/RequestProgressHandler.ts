export type ProgressCallback = (progress: number) => void;

export const handleProgressEvent = (progressCallback?: ProgressCallback) => {
  return (
    progressCallback &&
    ((progressEvent: any) => {
      progressCallback(progressEvent.loaded / progressEvent.total);
    })
  );
};
