type StreamVideoProps = {
  uid: string;
  title?: string;
};

export function StreamVideo({ uid, title = "Performance video" }: StreamVideoProps) {
  return (
    <div className="panel">
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingTop: "56.25%",
          overflow: "hidden",
          borderRadius: "0.75rem",
        }}
      >
        <iframe
          src={`https://iframe.videodelivery.net/${uid}`}
          title={title}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
          style={{
            border: "none",
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        />
      </div>
      <p style={{ marginTop: "0.75rem", fontSize: "0.95rem", fontWeight: 600 }}>{title}</p>
    </div>
  );
}
