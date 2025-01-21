"use client";

import * as React from "react";

import { Bolt, LoaderCircle } from "lucide-react";

import { toast } from "sonner";

import { useConfigStore } from "@/stores/config";

import type { Config } from "@/stores/config";

type LoadingState = "negotiating" | "loading" | null;

function getLoadingMessage(state: LoadingState) {
  switch (state) {
    case "negotiating":
      return "Negotiating with the server!";
    case "loading":
      return "Loading the image!";
    default:
      return "Loading!";
  }
}

function createPeerConnection(config: Config) {
  const _config: RTCConfiguration = {};

  const iceServers: RTCIceServer[] = [];

  if (config.stun) iceServers.push({ urls: config.stun });
  if (config.turn.url)
    iceServers.push({
      urls: config.turn.url,
      username: config.turn.username,
      credential: config.turn.password,
    });

  _config.iceServers = iceServers;
  return new RTCPeerConnection(_config);
}

async function negotiate(address: string, pc: RTCPeerConnection) {
  pc.addTransceiver("video", { direction: "recvonly" });

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  await new Promise<void>((resolve) => {
    if (pc.iceGatheringState === "complete") return resolve();
    const checkState = () => {
      if (pc.iceGatheringState === "complete") {
        pc.removeEventListener("icegatheringstatechange", checkState);
        resolve();
      }
    };
    pc.addEventListener("icegatheringstatechange", checkState);
  });

  try {
    const response = await fetch(`${address}/offer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sdp: pc.localDescription?.sdp,
        type: pc.localDescription?.type,
      }),
    });

    const answer = await response.json();
    await pc.setRemoteDescription(answer);
  } catch (_) {
    toast("Unable to connect to the server!", {
      description: "Configure the signaling server correctly!",
    });
  }
}

export default function Page() {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const pc = React.useRef<RTCPeerConnection | null>(null);

  const [loadingState, setLoadingState] =
    React.useState<LoadingState>("negotiating");

  const configStore = useConfigStore();

  React.useEffect(() => {
    if (!configStore.hasHydrated) return;

    const start = async () => {
      const peerConnection = createPeerConnection(configStore.config);

      peerConnection.addEventListener("track", (event) => {
        if (event.track.kind === "video" && videoRef.current) {
          videoRef.current.srcObject = new MediaStream([event.track]);
        }
      });

      const onConnectionStateChange = () => {
        const state = peerConnection.iceConnectionState;
        if (["disconnected", "failed", "closed"].includes(state)) {
          setLoadingState("loading");
          toast("Connection lost!", {
            description: "Reconnecting to the server!",
          });
        }
      };

      peerConnection.addEventListener(
        "iceconnectionstatechange",
        onConnectionStateChange,
      );

      pc.current = peerConnection;

      if (!configStore.config.address) return;
      await negotiate(configStore.config.address, peerConnection);
      setLoadingState("loading");
    };

    start();

    return () => {
      if (!pc.current) return;
      pc.current.close();
      pc.current = null;
    };
  }, [configStore.hasHydrated, configStore.config]);

  const handleVideoLoaded = () => {
    setLoadingState(null);
  };

  return (
    <main className="relative grid min-h-[var(--main-content-height)] px-6">
      <div className="mt-10 flex w-full flex-col items-center">
        <div className="relative grid aspect-video w-full max-w-3xl place-items-center overflow-clip rounded-xl bg-muted">
          <div className="flex flex-col items-center">
            {configStore.hasHydrated && !configStore.config.address ? (
              <>
                <Bolt className="size-5 text-muted-foreground" />
                <h1 className="mt-2 text-muted-foreground">
                  Waiting for configuration!
                </h1>
              </>
            ) : (
              <>
                <video
                  ref={videoRef}
                  className="absolute inset-0 h-full w-full rounded-xl"
                  autoPlay
                  playsInline
                  muted
                  onLoadedData={handleVideoLoaded}
                  onWaiting={() => setLoadingState("loading")}
                  onPlaying={() => setLoadingState(null)}
                />
                {loadingState && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
                    <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
                    <h1 className="mt-2 text-muted-foreground">
                      {getLoadingMessage(loadingState)}
                    </h1>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
