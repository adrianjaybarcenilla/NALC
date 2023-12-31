/* eslint-disable jsx-a11y/no-redundant-roles */
import React , {useState , useEffect} from 'react';
import axios from 'axios';
import './Home.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane , faPlus, faRobot , faUser, faPen, faCheck, faTrash} from '@fortawesome/free-solid-svg-icons'
import UserOption from '../../Components/UserOption';
import HomePage from '../../Components/HomePage';
import { useNavigate } from 'react-router-dom';

function Home() {
    const [input, setInput] = useState('');
    const [chatName , setChatName] = useState('');    
    const [chats , setChats] = useState([]);
    const [threadId , setThreadId] = useState(0);
    const [chatMsg , setChatMsg] = useState([]);
    const reversedChats = chats.slice().reverse();
    const [editModes, setEditModes] = useState(Array(reversedChats.length).fill(false));
    const [tempName, setTempName] = useState('');
    const [selectedThread, setSelectedThread] = useState('');
    const [loading, setLoading] = useState(false);
    const [chatCreated, setChatCreated] = useState(false);
    const [userData , setUserData] = useState([]);
    const [showHome , setShowHome] = useState(true);
    const navigate = useNavigate();

  // Set the initial token and headers
  axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('authToken')}`;

  // Set the session timeout duration (30 minutes in milliseconds)
  const sessionTimeoutDuration = 30 * 60 * 1000; // 30 minutes in milliseconds

  // Function to redirect the user to the login page
  const redirectToLogin = () => {
    window.location.href = '/';
  };

  // Function to reset the session timeout
  const resetSessionTimeout = () => {
    clearTimeout(sessionTimeout);
    sessionTimeout = setTimeout(redirectToLogin, sessionTimeoutDuration);
  };

  // Set the initial session timeout
  let sessionTimeout = setTimeout(redirectToLogin, sessionTimeoutDuration);

  // Attach an event listener to reset the session timeout on user activity
  document.addEventListener('mousemove', resetSessionTimeout);
  document.addEventListener('keydown', resetSessionTimeout);

  axios.interceptors.response.use(
    (response) => {
      resetSessionTimeout();
      return response;
    },
    (error) => {
      if (error.response && error.response.status === 401) {
        redirectToLogin();
      }
      return Promise.reject(error);
    }
  );

  const handleLogout = () => {
    localStorage.removeItem('authToken');
  
    redirectToLogin();
  };

    const handleInputChange = (identifier) => (e) => {
      if (identifier === "input") {
        setInput(e.target.value);
      } else if (identifier === "chat") {
        setChatName(e.target.value);
      }
  };

  const fetchUserData = async () => {
      try{
        const response = await axios.get('http://127.0.0.1:8000/api/users/details/');
        setUserData(response.data);
      } catch(error){
        console.error(error);
      }
  }

  const fetchChatsAndData = async (id) => {
    try {
      const responseChats = await axios.get('http://127.0.0.1:8000/api/users/threads/');
      setChats(responseChats.data);
  
      if (id !== undefined) {
        fetchDataAndMsg(id);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchChats = async () => {
    await fetchChatsAndData();
  };


  const fetchDataAndMsg = async (id) => {
    try {
      const responseThread = await axios.get(`http://127.0.0.1:8000/api/threads/${id}/`);
      const responseMsg = await axios.get(`http://127.0.0.1:8000/api/messages/thread/${id}/`);
  
      const messages = responseMsg.data.map(message => {
        const messageText = JSON.parse(message.message_text);
        const user = messageText.query;
        let text = messageText.response;
  
        return {
          user,
          text,
        };
      });
  
      setChatMsg(messages);
      setSelectedThread(responseThread.data.thread_name);
      setThreadId(id);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchData = async (id) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/threads/${id}/`);
      fetchDataAndMsg(id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateChat = async (name) => {
    try {
      const nameToUse = chatName !== '' ? chatName : name;
      setChatName(nameToUse);
      const response = await axios.post('http://127.0.0.1:8000/api/threads/', {
        thread_name: nameToUse,
      });
  
      const newThreadId = response.data.data.thread_id;
  
      // Perform any necessary state updates or additional actions here
      setChatName('');
      setThreadId(newThreadId);
      setChatCreated(true);
  
      // Fetch data and handle chat as needed
      fetchChats();
      fetchData(newThreadId);
      handleChat(newThreadId);
  
      return newThreadId;
    } catch (error) {
      alert("Something Went Wrong, Try Again!");
      console.error('Error:', error);
      throw error; // Rethrow the error to be caught by the caller
    }
  };
  

  const handleChat = async (id) => {
    try {
      setShowHome(false);
      fetchData(id);
      console.log("HandleChat" + id)
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditChat = async (id, index) => {
    try {
      // Use a callback function to get the latest value of tempName
      await axios.put(`http://127.0.0.1:8000/api/threads/${id}/`, {
        thread_name: tempName,
      });
  
      console.log(`Chat with id ${id} edited to ${tempName}`);
      setTempName('');
      const newEditModes = [...editModes];
      newEditModes[index] = false;
      setEditModes(newEditModes);
      fetchChats();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteAll = () => {
    try {
      axios.delete('http://127.0.0.1:8000/api/threads/delete-all/')
        .then(() => {
          // Once the delete request is successful, fetch new data and update the state
          fetchChats();
          setChatMsg([]);
          setShowHome(true);
          setSelectedThread("");
        })
        .catch(error => {
          console.error(error);
        });
    } catch (error) {
      console.error(error);
    }
  };
  const handleDeleteChat = async (id) => {
    try {
      const response = await axios.delete(`http://127.0.0.1:8000/api/threads/${id}/`);
      fetchChats();     
      setChatMsg([]);
      setShowHome(true);
      setSelectedThread("");
    } catch (error) {
      console.error(error);
    }
  }

  const toggleEditMode = (index, threadName) => {
    // Create a copy of the editModes array and toggle the edit mode for the specific item
    const newEditModes = [...editModes];
    newEditModes[index] = !newEditModes[index];
  
    setTempName(threadName);
    setEditModes(newEditModes);
  };
  
  
  useEffect(() => {  
      fetchData(threadId);
  }, [threadId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchUserData();
        await fetchChats();
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []); 
  

  const handleSendMessage = async () => {
    if (input.trim() === '') {
      // Display error or handle accordingly
    } else {
      setLoading(true);
  
      try {
        let currentThreadId;
  
        // Create a new Chat when no Chat is selected
        if (!chatCreated) {
          // Wait for the chat creation and get the chatId
          currentThreadId = await handleCreateChat("New Chat");
        } else {
          currentThreadId = threadId;
        }
  
        if (currentThreadId !== 0) {
          // Send the message
          await axios.post('http://127.0.0.1:8000/api/messages/create/', {
            thread_id: currentThreadId,
            query: input,
          });
  
          // Fetch data and messages after sending the message
          await fetchDataAndMsg(currentThreadId);
          setInput('');
        }
      } catch (error) {
        // Handle error
        alert("Something Went Wrong, Try Again!");
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  };
    
  return (
    <div className="container-fluid gx-0">
      {/* Modal */}
      <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-sm">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="staticBackdropLabel">New Chat</h1>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form class="row g-3 needs-validation">
                <div class="col">
                  <input type="text" class="form-control" id="validationCustom03" value={chatName} placeholder='Chat Name'required onChange={handleInputChange("chat")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleCreateChat();
                        window.location.reload();
                      }}}
                  />
                </div>
                <button type="button" class="btn btn-primary" data-bs-dismiss="modal" onClick={handleCreateChat}>Create</button>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* Side Bar */}
      <div className="chat-sidebar">
        <button type="button" class="btn btn-outline-light newChatBtn" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
            <FontAwesomeIcon icon={faPlus} style={{ color: "#ffffff" }} />
            <span style={{ marginLeft: "5px" }}>New Chat</span>
        </button>
        <div className='logoutBtn d-grid gap-2 col-2 mx-auto'>
          <UserOption userData={userData} Logout={handleLogout} DeleteAll={handleDeleteAll} navigate={navigate} />
        </div>
        <br/>
        <br/>
        <div style={{ overflowY: 'auto', height: '75%' }}>
        {reversedChats.map((chat, index) => (
          <div key={chat.thread_id} style={{ position: 'relative' }}>
            <button
              className="btn btn-warning btn-lg"
              role="button"
              aria-disabled="true"
              style={{ width: '100%', display: 'block', marginBottom: '10px' }}
              onClick={() => handleChat(chat.thread_id)}
            >
              {editModes[index] ? (
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                />
              ) : (
                <span>{chat.thread_name}</span>
              )}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'absolute', top: 0, right: 0  }}>
              <button
                className="btn btn-transparent btn-lg"
                style={{ marginRight: '0px' }}
                onClick={() => (editModes[index] ? handleEditChat(chat.thread_id, index) : toggleEditMode(index, chat.thread_name))}
              >
                {editModes[index] ? <FontAwesomeIcon icon={faCheck} style={{color: "#541212",}} /> : <FontAwesomeIcon icon={faPen} style={{color: "#541212",}} />}
              </button>
              <button
                className="btn btn-transparent btn-lg"
                onClick={() => handleDeleteChat(chat.thread_id)}
              >
                <FontAwesomeIcon icon={faTrash} style={{color: "#541212",}} />
              </button>
            </div>
          </div>
        ))}
        </div>
      </div>
      {/* Convo Page */}
      <div className="chat-input">
        <div className='convo'>
          <div className = "convo-message" style={{ overflowY: 'auto', height: '75%', width: '1100px', alignItems: 'center' }}>
            <div className='title'>
              <h2>{selectedThread}</h2>
            </div>
            <br/>
            {showHome ? (
              <HomePage/>
            ) : (
              chatMsg.map((message, index) => (
                <div key={index} style={{ marginBottom: '10px', padding: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)', fontSize: '20px' }}>
                  <FontAwesomeIcon icon={faUser} style={{ color: "#000000", marginRight: '5px', textShadow: '1px 1px 1px rgba(0, 0, 0, 0.1)' }} /> : {message.user}<br />
                  <br />
                  <FontAwesomeIcon icon={faRobot} style={{ color: "rgb(132, 24, 24)", marginRight: '5px', textShadow: '1px 1px 1px rgba(132, 24, 24, 0.5)' }} /> :
                  {Array.isArray(message.text) ? (
                    message.text.map((paper, i) => (
                      <div key={i}>{paper}</div>
                    ))
                  ) : (
                    " " + message.text
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        <div className='inputForm'>
            {loading && 
              <div>
                <div class="spinner-border text-secondary" role="status">
                </div>
                <span>Analyzing...</span>
              </div>    
            }
            <div className="input-group mb-1">
                <input type="text" className="form-control" aria-label="Recipient's username" aria-describedby="button-addon2" value={input} onChange={handleInputChange("input")}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSendMessage();
                    }
                }}/>
                <button className="btn btn-outline-secondary" type="button" id="button-addon2" onClick={handleSendMessage}>
                    <FontAwesomeIcon icon={faPaperPlane} style={{color: "#841818",}} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}

export default Home;