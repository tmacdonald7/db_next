type StreamVideoProps = {
  uid: string;
  title?: string;
};

export function StreamVideo({ uid, title = "Performance video" }: StreamVideoProps) {
  return (
    <div className="panel media-card">
      <div className="media-frame motif-ring">
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
      <p className="media-title">{title}</p>
    </div>
  );
}
