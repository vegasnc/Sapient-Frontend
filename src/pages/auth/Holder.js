import React, { useEffect, useState } from 'react';
import { Row, Col } from 'reactstrap';
import './auth.scss';
import Slide1 from '../../assets/images/login/building-1.jpg';
import Slide2 from '../../assets/images/login/building-2.jpg';
import Slide3 from '../../assets/images/login/building-3.jpg';
import Carousel from 'react-bootstrap/Carousel';

function Holder({ rightContent }) {
    const [img, setImg] = useState();
    var totalCount = 3;
    function ChangeIt() {
        var num = Math.ceil(Math.random() * totalCount);
        return num;
    }
    useEffect(() => {
        let i = ChangeIt();
        setImg(i);
    }, []);
    return (
        <Row>
            <Col lg={6} className="pr-0 pl-0">
                <Carousel controls={false} indicators={false}>
                    <Carousel.Item>
                        <img className="backgroundStyle name" src={img === 1 ? Slide1 : img === 2 ? Slide2 : Slide3} />
                        <Carousel.Caption>
                            <h3 className="name">"A radically better way of achieving efficient buildings."</h3>
                        </Carousel.Caption>
                    </Carousel.Item>
                </Carousel>
            </Col>
            <Col lg={6} className="pr-0 pl-0">
                <div className="rightSide">
                    <div className="rightContentStyle">{rightContent}</div>
                </div>
            </Col>
        </Row>
    );
}
export default Holder;
