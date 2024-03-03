import React, { useEffect, useState } from "react";
import "./CodeBlock.css";

import "highlight.js/styles/default.css";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";

import smileyImage from '../../media/smiley.png';
import sadSmileyImage from '../../media/sad_smiley.png'; 

import io, { Socket } from "socket.io-client";
import { useNavigate, useParams } from "react-router-dom";
import config from "../../config";
hljs.registerLanguage("javascript", javascript);

type CodeDictionary = {
  [key: string]: string;
};


interface FetchedData {
  codeDictionary: CodeDictionary;
}

const CodeBlock = () => {
  const navigate = useNavigate();
  const { codeTitleName } = useParams<{ codeTitleName: string }>();
  const [isMentorUser, setIsMentorUser] = useState<boolean>(false);
  const [codeContent, setCodeContent] = useState<string>("");
  const [solutionContent, setSolutionContent] = useState<string>("");
  const [countUsers, setCountUsers] = useState<number>(0);
  const [showSmiley, setShowSmiley] = useState<boolean>(false);
  const [showSadSmiley, setShowSadSmiley] = useState<boolean>(false);
  const [fetchedCodeDictionary, setFetchedCodeDictionary] = useState<CodeDictionary>({});
  const [fetchedSolutionDictionary, setFetchedSolutionDictionary] = useState<CodeDictionary>({});
  const [socket, setSocket] = useState<Socket | null>(null);

  const MAX_LINES = 15;

  const highlightedHtml = hljs.highlightAuto(codeContent).value;
  const solutionHighlightedHtml = hljs.highlightAuto(solutionContent).value;

  // Setting up socket connection and event listeners
  useEffect(() => {
    const newSocket = io(config.serverURL);
    setSocket(newSocket);

    newSocket.on("code update", (updatedCode) => {
      setCodeContent(updatedCode);
    });

    newSocket.on("assign role", ({ isMentorUser }) => {
      setIsMentorUser(isMentorUser);
    });

    newSocket.on("count users", ({ numberOfConnectedUsers }) => {
      setCountUsers(numberOfConnectedUsers);
    });

    // Fetching code + solution data
    fetch('http://localhost:4000/code-dictionary')
    .then(response => response.json())
    .then((data: FetchedData) => {
      const codeDictionary = data.codeDictionary;
      const formattedCodeDictionary: CodeDictionary = Object.keys(codeDictionary).reduce((acc: CodeDictionary, key: string) => {
        acc[key] = codeDictionary[key].replace(/\\n/g, '\n');
        return acc;
      }, {});
      
      setFetchedCodeDictionary(formattedCodeDictionary);
    })

    fetch('http://localhost:4000/solution-dictionary')
    .then(response => response.json())
    .then((data: FetchedData) => {
      const codeDictionary = data.codeDictionary;
      const formattedSolutionDictionary: CodeDictionary = Object.keys(codeDictionary).reduce((acc: CodeDictionary, key: string) => {
        acc[key] = codeDictionary[key].replace(/\\n/g, '\n');
        return acc;
      }, {});
      
      setFetchedSolutionDictionary(formattedSolutionDictionary);
    })
      

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Setting up code & solution in the codeBlocks
  useEffect(() => {
    const code: string = codeTitleName
      ? fetchedCodeDictionary[codeTitleName] || "Code not found"
      : "Code not found";
    setCodeContent(code);

    const solution: string = codeTitleName ? fetchedSolutionDictionary[codeTitleName] || "Solution not found" : "Solution not found";
    setSolutionContent(solution);
    console.log(solutionContent)
  }, [codeTitleName, fetchedCodeDictionary, fetchedSolutionDictionary]);

  const handleBackToLobby = () => {
    navigate("/");
  };

  // Check if the code & solution are equal, and present a smiley / sad smiley for 2 seconds
  const handleCompareText = () => {
    if (codeContent.trim() === solutionContent.trim()) {
      setShowSmiley(true)
      
      setTimeout(() => {
        setShowSmiley(false);
      }, 2000)
    }

    else{
      setShowSadSmiley(true)
    
      setTimeout(() => {
        setShowSadSmiley(false);
      }, 2000)
    }

  };

  // If the code has changed, check if the amount of lines smaller than MAX_LINES and transmit the code to the server
  const handleCodeChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.target;
    const lines = value.split("\n");

    if (lines.length <= MAX_LINES) {
      const newCode = event.target.value;
      setCodeContent(newCode);
      if (socket) socket.emit("code change", newCode);
    }
  };

  const title = `${codeTitleName?.replace(/-/g, " ")} Code`;

  return (
    // Show a smiley if showSmiley is true or showSadSmiley is true
    <div className="codeBlockContainer">
    {showSmiley ? (
      <img src={smileyImage} alt="Correct solution!" />
    ) : showSadSmiley ? <img src={sadSmileyImage} alt="Incorrect solution!" /> : (
      <>
        <div className="titleContainer">
          <div className="titleHeaders">
            {isMentorUser ? <h3 className="mentorStudentTitle">Hello Mentor,</h3> : <h3 className="mentorStudentTitle">Hello Student,</h3>}
            {<h3 className="countUsers">Active Users {countUsers}</h3>}
          </div>
          {codeTitleName && <h1 className="codeBlockTitle">{title}</h1>}
        </div>

        <div className="codeHeaders">
            {<h1 className="codeTitle">Code</h1>}
            {<h1 className="solutionTitle">Solution</h1>}
        </div>

        <div className="codeAndSolutionContainer">
          <div className="javascriptCodeBlock">
            <pre className="highlightedContent">
              <code dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
            </pre>
            <textarea
              className="javascriptCode"
              value={codeContent}
              onChange={handleCodeChange}
              readOnly={isMentorUser}
            />
          </div>

          <div className="javascriptCodeBlock">
            <pre className="highlightedContent">
              <code dangerouslySetInnerHTML={{ __html: solutionHighlightedHtml }} />
            </pre>
            <textarea
              className="javascriptCode"
              value={solutionContent}
              readOnly={true}
            />
          </div>
        </div>

        <br />
        <div className="buttonsContainer">
          <button className="compareButton" onClick={handleCompareText}>
            Compare!
          </button>
          <button className="returnButton" onClick={handleBackToLobby}>
            Back to Lobby
          </button>
        </div>
      </>
        )}
    </div>
  );
};

export default CodeBlock;
