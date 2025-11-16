import { useContext, useRef, useState } from "react";
import Webcam from "react-webcam";
import PropTypes from "prop-types";
import { StateContext } from "../../../Utils/StateProvider";

export default function Card({ name, style }) {
  const [isShown, setIsShown] = useState(false);
  const { setPinned } = useContext(StateContext);

  const videoConstraints1 = {
    width: 640,
    height: 480,
    facingMode: "user",
  };

  const webcamStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

  const webcamRef = useRef(null);

  const handleClick = () => {
    setPinned(name);
  };

  return (
    <div
      className="card"
      style={style}
      onMouseEnter={() => setIsShown(true)}
      onMouseLeave={() => setIsShown(false)}
    >
      {isShown && (
        <Webcam
          audio={false}
          style={webcamStyle}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints1}
        />
      )}

      {isShown && (
        <img
          className="pin"
          onClick={handleClick}
          src="images/pin.svg"
          width={24}
          height={24}
          alt="pin"
        />
      )}

      <div className="center">
        <img
          style={{ marginRight: 0 }}
          src="images/user.svg"
          width={30}
          height={30}
          alt="user"
        />
        <p className="name">{name}</p>
      </div>
    </div>
  );
}

Card.propTypes = {
  name: PropTypes.string.isRequired,
  style: PropTypes.object,
};
