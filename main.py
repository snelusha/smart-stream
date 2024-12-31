# note: debug purposes only
import os
import logging

import json

import asyncio

import cv2

import aiohttp_cors

from aiohttp import web
from aiortc import RTCPeerConnection, RTCConfiguration, RTCIceServer, RTCSessionDescription, VideoStreamTrack
from aiortc.contrib.media import MediaRelay
from aiortc.mediastreams import VideoFrame

logging.basicConfig(level=logging.INFO)

# note: debug purposes only
ROOT = os.path.dirname(__file__)

video_stream = None

active_peers = set()

class SmartStreamTrack(VideoStreamTrack):
  def __init__(self, cameras=[]):
    super().__init__()

    self.cameras = cameras if cameras else [0]
    self.current_camera = 0

    self.video_capture = None
    self._initialize_camera()

    self.camera_lock = asyncio.Lock()
    self.stop_camera_switch_task = False

    if len(self.cameras) > 1:
      self.camera_switch_task = asyncio.create_task(self._periodic_switch_camera())

  async def recv(self):
    pts, time_base = await self.next_timestamp()
    async with self.camera_lock:
      ret, frame = self.video_capture.read()
      if not ret:
        print(f"failed to read frame from camera {self.current_camera}")
        await self.switch_camera()
        frame = np.zeros((1080, 1920, 3), dtype=np.uint8)
    
    frame = VideoFrame.from_ndarray(frame, format="bgr24")
    frame.pts = pts
    frame.time_base = time_base

    return frame

  def _set_camera_properties(self):
    self.video_capture.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
    self.video_capture.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)

    self.video_capture.set(cv2.CAP_PROP_FPS, 15)

    self.video_capture.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    self.video_capture.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*'YUYV'))

  def _initialize_camera(self):
    while True:
      self.video_capture = cv2.VideoCapture(self.cameras[self.current_camera])
      if self.video_capture.isOpened():
        self._set_camera_properties()
        
        print(f"camera {self.current_camera} initialized")
        return
      print(f"camera {self.current_camera} failed to initialize")
      self.current_camera = (self.current_camera + 1) % len(self.cameras)

  async def _switch_camera(self):
    async with self.camera_lock:
      print(f"switching camera from {self.current_camera}")
      if self.video_capture: self.video_capture.release()
      self.current_camera = (self.current_camera + 1) % len(self.cameras)
      self._initialize_camera()
      print(f"switched camera to {self.current_camera}")

  async def _periodic_switch_camera(self):
    while not self.stop_camera_switch_task:
      await self._switch_camera()
      await asyncio.sleep(5)

async def start_stream():
  global video_stream
  if video_stream is None:
    print("starting video stream")
    video_stream = SmartStreamTrack(cameras=[0])

  return video_stream

async def stop_stream():
  global video_stream
  if video_stream is not None:
    print("stopping video stream")
    video_stream = None

async def offer(request):
  global video_stream, active_peers

  params = await request.json()
  offer = RTCSessionDescription(sdp=params["sdp"], type=params["type"])

  configuration = RTCConfiguration(
    iceServers=[
      RTCIceServer(urls="stun:stun.l.google.com:19302")
  ])

  pc = RTCPeerConnection(configuration)
  active_peers.add(pc)

  @pc.on("connectionstatechange")
  async def on_connectionstatechange():
    if pc.connectionState in ("closed", "failed"):
      active_peers.remove(pc)
      if not active_peers: await stop_stream()

  local_video = await start_stream()
  pc.addTrack(local_video)

  await pc.setRemoteDescription(offer)

  answer = await pc.createAnswer()
  await pc.setLocalDescription(answer)

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
html_route = app.router.add_get("/", index)
javascript_route = app.router.add_get("/client.js", javascript)

offer_route = app.router.add_post("/offer", offer)

cors.add(offer_route)
cors.add(html_route)
cors.add(javascript_route)

web.run_app(app, port=8080)
