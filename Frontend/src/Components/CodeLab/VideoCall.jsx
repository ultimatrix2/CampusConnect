import React, { useRef, useEffect, useState, useCallback } from "react";
import socket from "../../socket";
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff } from "lucide-react";

const VideoCall = ({ roomId, user, peerSocketId }) => {
    const [stream, setStream] = useState(null);
    const [peerStream, setPeerStream] = useState(null);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isCallActive, setIsCallActive] = useState(false);
    const [isReceivingCall, setIsReceivingCall] = useState(false);

    const myVideoRef = useRef();
    const peerVideoRef = useRef();
    const peerConnectionRef = useRef(null);
    const pendingOfferRef = useRef(null);
    const streamRef = useRef(null);

    const iceServers = {
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun2.l.google.com:19302" },
        ],
    };

    // Attach peer stream to video element whenever it changes
    useEffect(() => {
        if (peerVideoRef.current && peerStream) {
            peerVideoRef.current.srcObject = peerStream;
        }
    }, [peerStream]);

    // Attach local stream to video element
    useEffect(() => {
        if (myVideoRef.current && stream) {
            myVideoRef.current.srcObject = stream;
        }
    }, [stream]);

    const createPeerConnection = useCallback((localStream, targetSocketId) => {
        console.log("Creating peer connection to:", targetSocketId);
        const pc = new RTCPeerConnection(iceServers);

        // Add local tracks
        localStream.getTracks().forEach((track) => {
            pc.addTrack(track, localStream);
        });

        // Handle incoming tracks
        pc.ontrack = (event) => {
            console.log("Received remote track");
            if (event.streams && event.streams[0]) {
                console.log("Setting peer stream");
                setPeerStream(event.streams[0]);
            }
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate && targetSocketId) {
                socket.emit("webrtc-ice-candidate", {
                    to: targetSocketId,
                    candidate: event.candidate,
                });
            }
        };

        pc.onconnectionstatechange = () => {
            console.log("Connection state:", pc.connectionState);
            if (pc.connectionState === "connected") {
                setIsCallActive(true);
            }
        };

        return pc;
    }, []);

    useEffect(() => {
        // Get user media
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((currentStream) => {
                setStream(currentStream);
                streamRef.current = currentStream;
            })
            .catch((err) => console.error("Error accessing media devices:", err));

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    useEffect(() => {
        const handleOffer = async ({ offer, from }) => {
            console.log("Received offer from:", from);
            setIsReceivingCall(true);
            pendingOfferRef.current = { offer, from };
        };

        const handleAnswer = async ({ answer }) => {
            console.log("Received answer");
            if (peerConnectionRef.current) {
                await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
            }
        };

        const handleIceCandidate = async ({ candidate }) => {
            if (peerConnectionRef.current) {
                try {
                    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (err) {
                    console.error("Error adding ICE candidate:", err);
                }
            }
        };

        const handleCallEnded = () => {
            cleanupCall();
        };

        socket.on("webrtc-offer", handleOffer);
        socket.on("webrtc-answer", handleAnswer);
        socket.on("webrtc-ice-candidate", handleIceCandidate);
        socket.on("call-ended", handleCallEnded);

        return () => {
            socket.off("webrtc-offer", handleOffer);
            socket.off("webrtc-answer", handleAnswer);
            socket.off("webrtc-ice-candidate", handleIceCandidate);
            socket.off("call-ended", handleCallEnded);
        };
    }, []);

    const cleanupCall = () => {
        setIsCallActive(false);
        setIsReceivingCall(false);
        setPeerStream(null);
        pendingOfferRef.current = null;

        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
    };

    const callUser = async () => {
        const localStream = streamRef.current;
        if (!peerSocketId || !localStream) return;

        const pc = createPeerConnection(localStream, peerSocketId);
        peerConnectionRef.current = pc;

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("webrtc-offer", {
            to: peerSocketId,
            offer: offer,
            from: socket.id,
        });

        setIsCallActive(true);
    };

    const answerCall = async () => {
        const localStream = streamRef.current;
        if (!localStream || !pendingOfferRef.current) return;

        const { offer, from } = pendingOfferRef.current;

        const pc = createPeerConnection(localStream, from);
        peerConnectionRef.current = pc;

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("webrtc-answer", {
            to: from,
            answer: answer,
        });

        setIsReceivingCall(false);
        setIsCallActive(true);
    };

    const endCall = () => {
        socket.emit("end-call", { roomId });
        cleanupCall();
    };

    const toggleVideo = () => {
        if (streamRef.current) {
            streamRef.current.getVideoTracks().forEach((track) => {
                track.enabled = !track.enabled;
            });
            setIsVideoEnabled(!isVideoEnabled);
        }
    };

    const toggleAudio = () => {
        if (streamRef.current) {
            streamRef.current.getAudioTracks().forEach((track) => {
                track.enabled = !track.enabled;
            });
            setIsAudioEnabled(!isAudioEnabled);
        }
    };

    return (
        <div className="video-call-container">
            <div className="video-header">
                <span className="video-icon">📹</span>
                <span>Video Call</span>
                {isCallActive && <span style={{ color: '#22c55e', marginLeft: 'auto', fontSize: '0.75rem' }}>● Connected</span>}
            </div>

            <div className="video-grid">
                {/* My Video - Always rendered */}
                <div className="video-wrapper my-video">
                    <video
                        ref={myVideoRef}
                        autoPlay
                        muted
                        playsInline
                        style={{ display: stream ? 'block' : 'none' }}
                    />
                    {!stream && <div className="video-loading">Loading camera...</div>}
                    <span className="video-label">You</span>
                </div>

                {/* Peer Video - Always render the video element */}
                <div className="video-wrapper peer-video">
                    <video
                        ref={peerVideoRef}
                        autoPlay
                        playsInline
                        style={{ display: peerStream ? 'block' : 'none' }}
                    />

                    {!peerStream && (
                        isReceivingCall ? (
                            <div className="incoming-call">
                                <p>Incoming call...</p>
                                <button className="call-btn answer" onClick={answerCall}>
                                    <Phone size={18} /> Answer
                                </button>
                            </div>
                        ) : isCallActive ? (
                            <div className="waiting-call">
                                <p>Connecting video...</p>
                            </div>
                        ) : (
                            <div className="waiting-call">
                                <p>{peerSocketId ? "Ready to call" : "Waiting for partner..."}</p>
                                {peerSocketId && (
                                    <button className="call-btn start" onClick={callUser}>
                                        <Phone size={18} /> Start Call
                                    </button>
                                )}
                            </div>
                        )
                    )}

                    {peerStream && <span className="video-label">Partner</span>}
                </div>
            </div>

            <div className="video-controls">
                <button
                    className={`control-btn ${!isVideoEnabled ? "off" : ""}`}
                    onClick={toggleVideo}
                    title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
                >
                    {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                </button>
                <button
                    className={`control-btn ${!isAudioEnabled ? "off" : ""}`}
                    onClick={toggleAudio}
                    title={isAudioEnabled ? "Mute" : "Unmute"}
                >
                    {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                </button>
                {isCallActive && (
                    <button
                        className="control-btn end-call"
                        onClick={endCall}
                        title="End call"
                    >
                        <PhoneOff size={20} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default VideoCall;
