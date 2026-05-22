import { useEffect, useRef, useState } from "react";
import { socket } from "../socket";
import { useAuth } from "../context/AuthContext";

function VideoCall({ conversationId, initialOffer, onCloseLayout }) {
    const { user } = useAuth();

    // UI States
    const [callActive, setCallActive] = useState(false);
    const [receivingCall, setReceivingCall] = useState(!!initialOffer);
    const [callerSignal, setCallerSignal] = useState(initialOffer || null);
    const [statusMessage, setStatusMessage] = useState("");

    // Refs
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);
    const pendingCandidatesRef = useRef([]);

    // Temporary teardown splash screen delay
    const triggerEndSplash = (reasonMessage = "Call Disconnected") => {
        setStatusMessage(reasonMessage);

        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }

        setCallActive(false);
        setReceivingCall(false);

        setTimeout(() => {
            if (onCloseLayout) {
                onCloseLayout();
            }
        }, 2000);
    };

    // 1. INIT CAMERA ON LOAD & INITIATE CALL IF SENDER
    useEffect(() => {
        let isMounted = true;

        async function getMediaAndInit() {
            try {
                console.log("Requesting user hardware media devices...");
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });

                if (!isMounted) {
                    stream.getTracks().forEach((t) => t.stop());
                    return;
                }

                localStreamRef.current = stream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                if (!initialOffer) {
                    console.log(
                        "Initiating call: Creating offer for room:",
                        conversationId
                    );
                    const peerConnection = createPeerConnection(stream);
                    const offer = await peerConnection.createOffer();
                    await peerConnection.setLocalDescription(offer);
                    socket.emit("webrtc:offer", { offer, conversationId });
                }
            } catch (error) {
                console.log("Error accessing media:", error);
            }
        }

        getMediaAndInit();

        return () => {
            isMounted = false;
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((t) => t.stop());
            }
        };
    }, []);

    // 2. THE WEBRTC SETUP FACTORY
    const createPeerConnection = (customStream = null) => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
        }

        // 💥 ADD THIS ICE SERVERS CONFIGURATION OBJECT HERE:
        const iceServersConfig = {
            iceServers: [
                {
                    // Public Google STUN server (Fast lookup for relaxed/cross networks)
                    urls: "stun:stun.l.google.com:19302"
                },
                {
                    // Free Public TURN Relay Server (Forces connection through strict symmetric NAT firewalls)
                    urls: "turn:openrelay.metered.ca:443",
                    username: "openrelayproject",
                    credential: "openrelayproject"
                }
            ]
        };

        // 💥 PASS THE CONFIG DIRECTLY INTO THE CONSTRUCTOR HOOK BELOW:
        const peerConnection = new RTCPeerConnection(iceServersConfig);
        peerConnectionRef.current = peerConnection;

        const activeStream = customStream || localStreamRef.current;

        if (activeStream) {
            activeStream.getTracks().forEach((track) => {
                peerConnection.addTrack(track, activeStream);
            });
        }

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("webrtc:ice-candidate", {
                    candidate: event.candidate,
                    conversationId,
                });
            }
        };

        // 🚀 BONUS FIX: Let's also update your ontrack handler right here
        // so it appends late-arriving tracks instead of resetting the srcObject!
        peerConnection.ontrack = async (event) => {
            console.log("Remote stream received via ontrack!");
            if (remoteVideoRef.current) {
                // If a stream container is already assigned, cleanly add the track to it
                if (remoteVideoRef.current.srcObject) {
                    console.log("Appending secondary track to existing media stream.");
                    remoteVideoRef.current.srcObject.addTrack(event.track);
                    return;
                }

                // If it's the very first track, assign the baseline stream array cleanly
                if (event.streams && event.streams[0]) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                } else {
                    remoteVideoRef.current.srcObject = new MediaStream([event.track]);
                }

                setCallActive(true);

                try {
                    await remoteVideoRef.current.play();
                } catch (playError) {
                    console.log("Autoplay policy handling completed safely.", playError);
                }
            }
        };

        return peerConnection;
    };

    // 3. ANSWER THE CALL (The Receiver)
    const answerCall = async () => {
        if (!callerSignal) return;
        console.log("Answering call: Setting remote offer...");

        const peerConnection = createPeerConnection();
        await peerConnection.setRemoteDescription(
            new RTCSessionDescription(callerSignal)
        );

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit("webrtc:answer", { answer, conversationId });

        setReceivingCall(false);

        pendingCandidatesRef.current.forEach(async (candidate) => {
            try {
                await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
                console.error("Error running queued candidate", e);
            }
        });
        pendingCandidatesRef.current = [];
    };

    // 4. END THE CALL (Teardown)
    const endCall = (emitSignal = true) => {
        if (emitSignal) {
            console.log("Emitting webrtc:call-ended signal...");
            socket.emit("webrtc:call-ended", { conversationId });
        }
        triggerEndSplash("Call Ended");
    };

    // 5. ROOM ISOLATED SOCKET LISTENERS
    useEffect(() => {
        const handleAnswer = async ({ answer, senderId }) => {
            if (senderId === user.id) return;
            console.log("Received remote answer via socket.");

            const peerConnection = peerConnectionRef.current;
            if (
                peerConnection &&
                peerConnection.signalingState === "have-local-offer"
            ) {
                await peerConnection.setRemoteDescription(
                    new RTCSessionDescription(answer)
                );

                pendingCandidatesRef.current.forEach(async (c) => {
                    try {
                        await peerConnection.addIceCandidate(new RTCIceCandidate(c));
                    } catch (e) {
                        console.error(e);
                    }
                });
                pendingCandidatesRef.current = [];
            }
        };

        const handleIceCandidate = async ({ candidate, senderId }) => {
            if (senderId === user.id) return;

            const peerConnection = peerConnectionRef.current;
            if (peerConnection && peerConnection.remoteDescription) {
                try {
                    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (e) {
                    console.error("Error adding active candidate", e);
                }
            } else {
                pendingCandidatesRef.current.push(candidate);
            }
        };

        const handleCallEnded = ({ senderId, conversationId: incomingRoomId }) => {
            if (senderId === user.id) return;

            // CRITICAL VERIFICATION: Drop lines only if room matches active frame session
            if (incomingRoomId && incomingRoomId !== conversationId) {
                console.log("Ignored unassociated call-ended broadcast.");
                return;
            }
            console.log("The remote user hung up.");
            triggerEndSplash("Remote user hung up");
        };

        const handleBusySignal = ({ senderId, conversationId: incomingRoomId }) => {
            if (senderId === user.id) return;

            // CRITICAL VERIFICATION: Make sure rejections belong to our current dials
            if (incomingRoomId && incomingRoomId !== conversationId) return;
            console.log("Target peer signaled a busy line state.");
            triggerEndSplash("User is busy on another call");
        };

        socket.on("webrtc:answer", handleAnswer);
        socket.on("webrtc:ice-candidate", handleIceCandidate);
        socket.on("webrtc:call-ended", handleCallEnded);
        socket.on("webrtc:busy-signal", handleBusySignal);

        return () => {
            socket.off("webrtc:answer", handleAnswer);
            socket.off("webrtc:ice-candidate", handleIceCandidate);
            socket.off("webrtc:call-ended", handleCallEnded);
            socket.off("webrtc:busy-signal", handleBusySignal);
        };
    }, [user.id, conversationId]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-4 text-white">
            {/* STATUS HEADER BANNER */}
            <div className="text-center z-10">
                <h3
                    className={`text-xl font-bold ${statusMessage.includes("busy") || statusMessage.includes("Ended")
                        ? "text-red-400"
                        : "text-emerald-400"
                        }`}
                >
                    {statusMessage ||
                        (callActive
                            ? "🔒 Connected Securely"
                            : receivingCall
                                ? "🔔 Incoming Request..."
                                : "📡 Connecting Line...")}
                </h3>
            </div>

            {/* CONTROLS */}
            <div className="flex gap-4 z-10">
                {receivingCall && !callActive && !statusMessage && (
                    <button
                        onClick={answerCall}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg font-bold animate-pulse hover:bg-blue-600 transition"
                    >
                        Answer Private Call
                    </button>
                )}

                {!statusMessage && (
                    <button
                        onClick={() => endCall(true)}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition"
                    >
                        {callActive ? "End Call" : "Cancel Call"}
                    </button>
                )}
            </div>

            {/* VIDEO FEEDS */}
            <div className="flex flex-wrap items-center justify-center gap-6 w-full max-w-4xl">
                <div className="relative">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-[400px] h-[300px] object-cover rounded-xl border-2 border-gray-700 bg-gray-900 scale-x-[-1]"
                    />
                    <span className="absolute bottom-3 left-3 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                        You
                    </span>
                </div>

                <div className="relative">
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-[400px] h-[300px] object-cover rounded-xl border-2 bg-gray-900 ${callActive ? "border-green-500" : "border-gray-700"
                            }`}
                    />
                    {!callActive && !statusMessage && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium bg-gray-900 bg-opacity-40 rounded-xl">
                            {receivingCall ? "Incoming call stream..." : "Calling peer..."}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default VideoCall;