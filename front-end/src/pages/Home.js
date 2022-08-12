import React from "react";
import "../assets/css/styles.css";
import NavBar from "../components/NavBar";
import Hero from "../components/Hero";
import Mint from "../components/Mint";
import Roadmap from "../components/Roadmap";
import Faq from "../components/Faq";
import Footer from "../components/Footer";


const Home = () => {

    return (
        <div className="home" >
            <NavBar />
            <Hero />
            <Mint />
            <Roadmap />
            <Faq />
            <Footer />
        </div>
    );
};

export default Home;
