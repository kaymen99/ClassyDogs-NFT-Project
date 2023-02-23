import React from 'react';
import { AiOutlineTwitter, AiOutlineGithub } from "react-icons/ai";
import { RiDiscordFill } from "react-icons/ri";

function Footer() {
    return (
        <div className='footer'>
            <div className="footer-links">
                <div className="footer-links_logo">
                    <div>
                        <div style={{ fontFamily: "sans serif", color: "#FFF", fontWeight: "700", fontSize: "26px", height: "35px", width: "180px", backgroundColor: "#f82167", color: "#1e242f" }}>
                            CLASSYDOGS
                        </div>
                    </div>
                    <div>
                        <h3>Feel Free To Contact Me.</h3>
                    </div>
                </div>
                <div className="footer-links_div">
                    <h4>ClassyDogs</h4>
                    <p>Explore</p>
                    <p>How it Works</p>
                    <p>Roadmap</p>
                    <p>Contact Us</p>
                </div>
                <div className="footer-links_div">
                    <h4>Support</h4>
                    <p>Help center</p>
                    <p>Terms of service</p>
                    <p>Legal</p>
                    <p>Privacy policy</p>
                </div>
            </div>
            <div className="footer-copyright">
                <div>
                    <p> © {(new Date().getFullYear())} ClassyDogs, Inc. All Rights Reserved</p>
                </div>
                <div>
                    <a href='https://github.com/kaymen99'>
                        <AiOutlineGithub size={25} color='white' className='footer-icon' />
                    </a>
                    <a href='https://github.com/kaymen99'>
                        <AiOutlineTwitter size={25} color='white' className='footer-icon' />
                    </a>
                    <a href='https://github.com/kaymen99'>
                        <RiDiscordFill size={25} color='white' className='footer-icon' />
                    </a>


                </div>

            </div>
        </div>
    )
}

export default Footer
