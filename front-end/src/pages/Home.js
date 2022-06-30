import React from "react";
import "../assets/css/styles.css";
import NavBar from "../components/NavBar";
import Hero from "../components/Hero";
import Mint from "../components/Mint";
import Footer from "../components/Footer";
import Roadmap from "../components/Roadmap";

const Home = () => {

    return (
        <div className="home" >
            <NavBar />
            <Hero />
            <Mint />
            <Roadmap />
            <Footer />
        </div>
    );
};

export default Home;