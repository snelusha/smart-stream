var pc = null;
var statsInterval = null;

function negotiate() {
    pc.addTransceiver('video', { direction: 'recvonly' });
    pc.addTransceiver('audio', { direction: 'recvonly' });

    return pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => {
            // Wait for ICE gathering to complete
            return new Promise((resolve) => {
                if (pc.iceGatheringState === 'complete') {
                    resolve();
                } else {
                    const checkState = () => {
                        if (pc.iceGatheringState === 'complete') {
                            pc.removeEventListener('icegatheringstatechange', checkState);
                            resolve();
                        }
                    };
                    pc.addEventListener('icegatheringstatechange', checkState);
                }
            });
        })
        .then(() => {
            const offer = pc.localDescription;
            return fetch('/offer', {
                body: JSON.stringify({
                    sdp: offer.sdp,
                    type: offer.type,
                }),
                headers: { 'Content-Type': 'application/json' },
                method: 'POST'
            });
        })
        .then((response) => response.json())
        .then((answer) => pc.setRemoteDescription(answer))
        .catch((e) => {
            console.error(e);
            alert(`Error during negotiation: ${e.message}`);
        });
}

function start() {
    var config = {
        sdpSemantics: 'unified-plan'
    };

    if (document.getElementById('use-stun').checked) {
        config.iceServers = [{ urls: ['stun:stun.l.google.com:19302'] }];
    }

    pc = new RTCPeerConnection(config);

    // Connect audio / video tracks
    pc.addEventListener('track', (evt) => {
        if (evt.track.kind === 'video') {
            document.getElementById('video').srcObject = evt.streams[0];
        } else if (evt.track.kind === 'audio') {
            document.getElementById('audio').srcObject = evt.streams[0];
        }
    });

    document.getElementById('start').style.display = 'none';
    negotiate();
    document.getElementById('stop').style.display = 'inline-block';

    // Start monitoring stats
    statsInterval = setInterval(async () => {
        if (pc) {
            const stats = await pc.getStats();
            let bytesSent = 0;
            let bytesReceived = 0;

            stats.forEach((report) => {
                if (report.type === 'outbound-rtp' && report.bytesSent) {
                    bytesSent += report.bytesSent;
                }
                if (report.type === 'inbound-rtp' && report.bytesReceived) {
                    bytesReceived += report.bytesReceived;
                }
            });

            document.getElementById('upload').innerText = `Upload: ${(bytesSent / 1024).toFixed(2)} KB`;
            document.getElementById('download').innerText = `Download: ${(bytesReceived / 1024).toFixed(2)} KB`;
        }
    }, 1000);
}

function stop() {
    document.getElementById('stop').style.display = 'none';

    // Stop monitoring stats
    clearInterval(statsInterval);
    statsInterval = null;

    // Close peer connection after a short delay
    setTimeout(() => {
        if (pc) {
            pc.close();
            pc = null;
        }
    }, 500);

    // Reset UI
    document.getElementById('start').style.display = 'inline-block';
    document.getElementById('upload').innerText = 'Upload: 0 KB';
    document.getElementById('download').innerText = 'Download: 0 KB';
}
