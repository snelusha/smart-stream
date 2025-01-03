"use client";

import * as React from "react";

import { Bolt, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useConfigStore } from "@/stores/config";

function createPeerConnection(useStun: boolean) {
  const config: RTCConfiguration = {};

  if (useStun) config.iceServers = [{ urls: "stun:stun.l.google.com:19302" }];

  return new RTCPeerConnection(config);
}

async function negotiate(address: string, pc: RTCPeerConnection) {
  pc.addTransceiver("video", { direction: "recvonly" });
  pc.addTransceiver("audio", { direction: "recvonly" });

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  await new Promise<void>((resolve) => {
    if (pc.iceGatheringState === "complete") return resolve();
    const checkState = () => {
      console.log(pc.iceGatheringState);
      if (pc.iceGatheringState === "complete") {
        pc.removeEventListener("icegatheringstatechange", checkState);
        resolve();
      }
    };
    pc.addEventListener("icegatheringstatechange", checkState);
  });

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
}

export default function Page() {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const pc = React.useRef<RTCPeerConnection | null>(null);

  const configStore = useConfigStore();

  React.useEffect(() => {
    if (!configStore.hasHydrated) return;

    const start = async () => {
      const peerConnection = createPeerConnection(true);

      peerConnection.addEventListener("track", (event) => {
        if (event.track.kind === "video" && videoRef.current) {
          videoRef.current.srcObject = new MediaStream([event.track]);
          console.log("track", event.track);
        }
      });

      pc.current = peerConnection;

      if (!configStore.config.address) return;
      await negotiate(configStore.config.address, peerConnection);
    };

    start();
  }, [configStore.hasHydrated, configStore.config]);

  React.useEffect(() => {
    console.log("mm", pc.current?.iceConnectionState);
  }, [pc.current?.iceConnectionState]);

  return (
    <main className="relative grid min-h-[var(--main-content-height)] px-6">
      <div className="mt-10 flex w-full flex-col items-center">
        <div className="relative grid aspect-video w-full max-w-3xl place-items-center rounded-xl bg-muted">
          <div className="flex flex-col items-center">
            {configStore.hasHydrated && !configStore.config.address ? (
              <>
                <Bolt className="size-5 text-muted-foreground" />
                <h1 className="mt-2 text-muted-foreground">
                  Waiting for configuration!
                </h1>
              </>
            ) : true ? (
              <video
                ref={videoRef}
                className="w-full h-full rounded-xl"
                autoPlay
                playsInline
                muted
                controls
              />
            ) : (
              <>
                <LoaderCircle className="size-5 text-muted-foreground animate-spin" />
                <h1 className="mt-2 text-muted-foreground">
                  Connecting to the server!
                </h1>
              </>
            )}
          </div>
        </div>
      </div>
      <footer className="absolute inset-x-0 bottom-4 flex flex-col items-center">
        <p className="text-muted-foreground">
          Made by a&nbsp;
          <span className="font-medium text-secondary-foreground">human</span>
          &nbsp;in earth!
        </p>
      </footer>
    </main>
  );
}
