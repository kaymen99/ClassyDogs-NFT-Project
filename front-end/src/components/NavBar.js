import React from 'react';
import Account from "./Account";
import { Navbar, Container, Nav } from "react-bootstrap"
import 'bootstrap/dist/css/bootstrap.css';


function NavBar() {
    return (
        <>
            <Navbar bg="" variant="dark" expand="lg">
                <Container>
                    <Navbar.Brand href="/" style={{ fontFamily: "sans serif", color: "#FFF", fontWeight: "700", fontSize: "26px" }}>
                        <div style={{ height: "35px", width: "180px", backgroundColor: "#f82167", color: "#1e242f" }}>
                            CLASSYDOGS
                        </div>

                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="navbarScroll" />
                    <Navbar.Collapse id="navbarScroll">
                        <Nav activeKey={window.location.pathname}
                            className="me-auto"
                            style={{ maxHeight: '100px' }}
                            navbarScroll>
                        </Nav>
                        <Account />
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    )
}

export default NavBar;