import React from 'react';
import Typewriter from 'typewriter-effect';
import styled from 'styled-components';
import { Button } from '@mui/material';

function TypeWriterText() {
    return (
        <>
            <Title>
                Discover a new era of Cool
                <Typewriter
                    options={{
                        autoStart: true,
                        loop: true
                    }}
                    onInit={(typewriter) => {
                        typewriter.typeString(`<span class='text-1'>NFTs.</span>`)
                            .pauseFor(2000)
                            .deleteAll()
                            .typeString(`<span class='text-1'>Collectible items.</span>`)
                            .pauseFor(2000)
                            .deleteAll()
                            .typeString(`<span class='text-1'>Classy Dogs!</span>`)
                            .pauseFor(2000)
                            .deleteAll()
                            .start();
                    }}
                />
            </Title>
            <SubTitle>Bored of the Katies? try Somthing new.</SubTitle>
            <ButtonContainer>
                <Button className='bt-linear'
                    variant="contained"
                    color="primary">
                    <a href='#raodmap' style={{ textDecoration: 'none', color: 'white' }}>
                        Explore
                    </a>
                </Button>
            </ButtonContainer>
        </>
    )
}

export default TypeWriterText;


const Title = styled.h2`
    font-size: 44px;
    font-weight: 600;
    font-family: "Akaya Telivigala", cursive;
    color: #fff;
    text-transform: capitalize;
    text-align: left;
    width: 80%;
    align-self: flex-start;

    span {
        text-transform: uppercase;
        font-size: 32px;
        font-weight: 600;
        font-family: "Akaya Telivigala", cursive;
    }
    .text-1 {
        color: #f82167;
    }
`
const SubTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: #fff;
    text-transform: capitalize;
    text-align: left;
    margin-bottom: 1rem;
    width: 80%;
    align-self: flex-start;
`

const ButtonContainer = styled.div`
    width: 80%;
    align-self: flex-start;
    text-align: center;
    padding-top: 20px;
`
