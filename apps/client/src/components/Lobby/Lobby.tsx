import "./Lobby.css";
import { Link } from "react-router-dom";

const codeBlocks = [
  { id: 1, name: "async-case" },
  { id: 2, name: "closure-case" },
  { id: 3, name: "promise-case" },
  { id: 4, name: "event-handling" },
];

const Lobby = () => {
  return (
    <div className="lobbyContainer">
      <h1 className="LobbyTitle">Choose Code Block</h1>
      <ul className="codeBlocklist">
        {codeBlocks.map((block) => (
          <Link
            key={block.id}
            className="listItem"
            to={`/codeblock/${block.name}`}
          >
            {block.name}
          </Link>
        ))}
      </ul>
    </div>
  );
};

export default Lobby;
