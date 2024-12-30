# note: debug purposes only
import os

import json
import logging

import asyncio

import cv2

import aiohttp_cors

from aiohttp import web
from aiortc import RTCPeerConnection, RTCSessionDescription, VideoStreamTrack
from aiortc.contrib.media import MediaRelay
from aiortc.mediastreams import VideoFrame

# note: debug purposes only
ROOT = os.path.dirname(__file__)

logging.basicConfig(level=logging.INFO)

relay = MediaRelay()

video_stream = None

active_peers = set()

class SmartStreamTrack(VideoStreamTrack):
  def __init__(self):
    super().__init__()
    self.image = cv2.imread('image.png')
    if (self.image is None):
      raise Exception('Image not found')

  async def recv(self):
    pts, time_base = await self.next_timestamp()
    frame = self.image.copy()

    frame = VideoFrame.from_ndarray(frame, format="bgr24")
    frame.pts = pts
    frame.time_base = time_base

    return frame

async def start_stream():
  global video_stream
  if video_stream is None:
    logging.info("starting video stream")
    video_stream = SmartStreamTrack()

  return relay.subscribe(video_stream)

async def stop_stream():
  global video_stream
  if video_stream is not None:
    logging.info("stopping video stream")
    video_stream = None

async def offer(request):
  global video_stream, active_peers

  params = await request.json()
  offer = RTCSessionDescription(sdp=params["sdp"], type=params["type"])

  pc = RTCPeerConnection()
  active_peers.add(pc)

  @pc.on("connectionstatechange")
  async def on_connectionstatechange():
    if pc.connectionState in ("closed", "failed"):
      active_peers.remove(pc)
      if not active_peers: await stop_stream()

  local_video = await start_stream()
  pc.addTrack(local_video)

  await pc.setRemoteDescription(offer)
  # logging.info("set remote description")

  answer = await pc.createAnswer()
  # logging.info("created answer")
  await pc.setLocalDescription(answer)
  # logging.info("set local description")

  return web.json_response(
    content_type="application/json",
    text=json.dumps({
      "sdp": pc.localDescription.sdp,
      "type": pc.localDescription.type
    }))

async def on_shutdown(app):
  coros = [pc.close() for pc in active_peers]
  await asyncio.gather(*coros)
  active_peers.clear()

  if video_stream: await stop_stream()

app = web.Application()

cors = aiohttp_cors.setup(app, defaults={
  "*": aiohttp_cors.ResourceOptions(
    allow_credentials=True,
    expose_headers="*",
    allow_headers="*",
  )
})

app.on_shutdown.append(on_shutdown)

# note: debug purposes only
async def index(request):
  content = open(os.path.join(ROOT, "index.html"), "r").read()
  return web.Response(content_type="text/html", text=content)

# note: debug purposes only
async def javascript(request):
  content = open(os.path.join(ROOT, "client.js"), "r").read()
  return web.Response(content_type="application/javascript", text=content)

# note: debug purposes only
app.router.add_get("/", index)
app.router.add_get("/client.js", javascript)

offer_route = app.router.add_post("/offer", offer)
cors.add(offer_route)

web.run_app(app, port=8080)
