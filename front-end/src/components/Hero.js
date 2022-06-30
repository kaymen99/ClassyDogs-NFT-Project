import React from "react";
import styled from 'styled-components';
import home from "../assets/images/home.gif"
import TypeWriterText from "./TypeWriterText";

function Hero() {
    return (
        <div className="header" >
            <div className="header-container">
                <div className="header-box">
                    <TypeWriterText />
                </div>
                <div className="header-box" style={{ paddingLeft: "10%" }}>
                    <VideoContainer>
                        <img src={home} />
                    </VideoContainer>
                </div>
            </div>
        </div>
    );
}

export default Hero;

const VideoContainer = styled.div`
    width: 100%;
    video (
        width: 100%;
        height: auto;
    )
`