import logo from './logo.svg';
import './App.css';
import React, { useEffect, useRef, useState } from "react";
import { Row, Col } from 'react-simple-flex-grid';
import "react-simple-flex-grid/lib/main.css";
import {
  MeetingProvider,
  MeetingConsumer,
  useMeeting,
  useParticipant,
} from "@videosdk.live/react-sdk";

import { getToken, createMeeting } from "./api";

const chunk = (arr) => {
  const newArr = [];
  while (arr.length) newArr.push(arr.splice(0, 3));
  return newArr;
};


function ParticipantView(props) {
  const webcamRef = useRef(null);
  const micRef = useRef(null);
  const screenShareRef = useRef(null);

  const {
    displayName,
    webcamStream,
    micStream,
    screenShareStream,
    webcamOn,
    micOn,
    screenShareOn
  } = useParticipant(props.participantId);

  useEffect(() => {
    if (webcamRef.current) {
      if (webcamOn) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(webcamStream.track);

        webcamRef.current.srcObject = mediaStream;
        webcamRef.current
          .play()
          .catch((error) =>
            console.error("videoElem.current.play() failed", error)
          );
      } else {
        webcamRef.current.srcObject = null;
      }
    }
  }, [webcamStream, webcamOn]);

  useEffect(() => {
    if (micRef.current) {
      if (micOn) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);

        micRef.current.srcObject = mediaStream;
        micRef.current
          .play()
          .catch((error) =>
            console.error("videoElem.current.play() failed", error)
          );
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn]);

  useEffect(() => {
    if (screenShareRef.current) {
      if (screenShareOn) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(screenShareStream.track);

        screenShareRef.current.srcObject = mediaStream;
        screenShareRef.current
          .play()
          .catch((error) =>
            console.error("videoElem.current.play() failed", error)
          );
      } else {
        screenShareRef.current.srcObject = null;
      }
    }
  }, [screenShareStream, screenShareOn]);


  return (
    <div key={props.participantId} >
      <audio ref={micRef} autoPlay />
      {webcamRef ||  micOn ? (<div>
      <h2>{displayName}</h2>
      <video
        height={"100%"}
        width={"100%"}
        ref={webcamRef}
        autoPlay
      />
      </div>) : null }
      {screenShareOn ? (
      <div>
        <h2>Screen Shared</h2>
        <video
          height={"100%"}
          width={"100%"}
          ref={screenShareRef}
          autoPlay
        />
      </div>) : null }
      <br/>
      <span>Mic:{micOn ? "Yes": "No"}, Camera: {webcamOn ? "Yes" : "No"}, Screen Share: {screenShareOn ? "Yes" : "No"}</span>
    </div>
  );
}



function MeetingGrid(props) {
  const [joined, setJoined] = useState(false)
  const {
    join, 
    leave,  
    toggleMic,
    toggleWebcam,
    toggleScreenShare
  } = useMeeting()
  const { participants } = useMeeting();
  const joinMeeting = () => {
    setJoined(true)
    join()
  }
  return (
    <div>
      <header>Meeting Id: {props.meetingId}</header>
      {joined ? 
      (
        <div >
          <button  onClick={leave}>
            Leave
          </button>
          <button  onClick={toggleMic}>
            toggleMic
          </button>
          <button  onClick={toggleWebcam}>
            toggleWebcam
          </button>
          <button  onClick={toggleScreenShare}>
            toggleScreenShare
          </button> 
        </div>
      ) 
      : (<button  onClick={joinMeeting}>
        Join
      </button>)}
      <div
        
      >
        {chunk([...participants.keys()]).map((k) => (
          <Row  key={k}  gutter={80}>
              {k.map((l) => (
                <Col span={4}>
                  <ParticipantView key={l} participantId={l} />
                </Col>
              ))}
          </Row>
        ))}
      </div>
      
    </div>
  )
}

function JoinScreen({updateMeetingId, getMeetingAndToken}) {
  return(
    <div>
      <input type="text" placeholder="Enter Meeting Id" onChange={(e) => {updateMeetingId(e.target.value)}}  />
      <button  onClick={getMeetingAndToken}>
        Join
      </button>
      <button  onClick={getMeetingAndToken}>
        Create Meeting
      </button>
    </div>
  );
}


function App() {
  const [token, setToken] = useState(null);
  const [meetingId, setMeetingId] = useState(null);

  const getMeetingAndToken = async () => {
    const token = await getToken();
    setToken(token);
    setMeetingId(meetingId ? meetingId : (await createMeeting({ token })));
  };

  const updateMeetingId = (meetingId) => {
    setMeetingId(meetingId)
  }

  return token && meetingId ? (
    <MeetingProvider
      config={{
        meetingId,
        micEnabled: true,
        webcamEnabled: true,
        name: "John doe",
      }}
      token={token}
    >
      <MeetingConsumer>
        {() => <MeetingGrid meetingId={meetingId} getMeetingAndToken={getMeetingAndToken}  />}
      </MeetingConsumer>
    </MeetingProvider>
  ) : (
    <JoinScreen updateMeetingId={updateMeetingId} getMeetingAndToken={getMeetingAndToken}   />
  );
}

export default App;
