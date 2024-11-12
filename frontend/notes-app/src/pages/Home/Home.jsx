import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import ProfileInfo from '../../components/Cards/ProfileInfo';
import Notecard from '../../components/Cards/Notecard';
import { MdAdd } from 'react-icons/md';
import AddEditNotes from './AddEditNotes';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import Toast from '../../components/ToastMessage/Toast';
import EmptyCard from '../../components/EmptyCard/EmptyCard';
import AddNotesImg from  '../../assets/images/add_img.webp';
const Home = () => {
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: 'add',
    data: null,
  });

  const [showToastMsg,setShowToastMsg]=useState({
    isShown:false,
    message:"",
    type:'add',

  })
  const [allNotes, setAllNotes] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const[isSearch, setIsSearch]=useState(false);

  const navigate = useNavigate();


  const handleEdit=(noteDetails) =>{
    setOpenAddEditModal({isShown:true, data: noteDetails, type:'edit'});
  }
  const handleCloseToast=()=>{
  setShowToastMsg({
    isShown:false,
    message: ""
    
  })
  }

  const showToastMessage =(message, type)=>{
    setShowToastMsg({
      isShown:true,
      message,
      type
      
    })
    }

  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get('/get-user');
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
    }
  };

  const getAllNotes = async () => {
    try {
      const response = await axiosInstance.get('/get-all-notes');
      if (response.data && response.data.notes) {
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log('An unexpected error occurred. Please try again later.');
    }
  };

  const deleteNote=async(data) =>{
    const noteId=data._id;
    try {
      const response = await axiosInstance.delete(`/delete-note/${noteId}`, {
        
      });
      if (response.data && !response.data.error) {
        showToastMessage('Note Deleted successfully','delete');
        getAllNotes();
        
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        console.log('An unexpected error occurred. Please try again later.');
      }
    }
  };
  
  const handleClearSearch=()=>{
    setIsSearch(false);
    getAllNotes();
  }

  const onSearchNote = async (query) => {
    try {
      const response = await axiosInstance.get('/search-notes/', {
        params: { query },
      });
      if (response.data && response.data.notes) {
        setIsSearch(true);
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const updateIsPinned = async (nodeData) => {
    const noteId = nodeData._id;
    try {
      // Toggle the `isPinned` state based on `nodeData.isPinned`
      const response = await axiosInstance.put(`/update-note-pinned/${noteId}`, {
        isPinned: !nodeData.isPinned
      });
  
      if (response.data && response.data.note) {
        showToastMessage('Note updated successfully');
        getAllNotes(); // Refresh the notes list
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  

  
  useEffect(() => {
    getAllNotes();
    getUserInfo().catch(error => console.error('Failed to fetch user info:', error));;
  }, []);


  return (
    <>
      <Navbar userInfo={userInfo} onSearchNote={onSearchNote} handleClearSearch={handleClearSearch}/>

<div className="container mx-auto">
  {allNotes.length > 0 ? (
    <div className="grid grid-cols-3 gap-4 mt-8">
      {allNotes.map((item) => (
        <Notecard
          key={item.id}
          title={item.title}
          date={item.createdOn}
          content={item.content}
          tags={item.tags}
          isPinned={item.isPinned}
          onEdit={() => handleEdit(item)}
          onDelete={() => deleteNote(item)}
          onPinNote={() => updateIsPinned(item)} // Implement `handlePin` function if pinning is needed
        />
      ))}
    </div>
  ) : (
    <EmptyCard imgSrc={AddNotesImg} message={"Click Add button to create your first note "} />
  )}
</div>

      <button
        className="w-16 h-16 flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10"
        onClick={() => {
          setOpenAddEditModal({ isShown: true, type: 'add', data: null });
        }}
      >
        <MdAdd className="text-[32px] text-white" />
      </button>

      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => {
          setOpenAddEditModal({ isShown: false, type: 'add', data: null });
        }}
        style={{ overlay: { backgroundColor: 'rgba(0, 0, 0, 0.2)' } }}
        contentLabel=""
        className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll"
      >
        <AddEditNotes
          
          type={openAddEditModal.type}
          nodeData={openAddEditModal.data}
          onClose={() => {
            setOpenAddEditModal({ isShown: false, type: 'add', data: null });
          }}
          getAllNotes={getAllNotes}
          showToastMessage={showToastMessage}
        />
      </Modal>
      <Toast 
      isShown={showToastMsg.isShown}
      message={showToastMsg.message}
      type={showToastMsg.type}
      onClose={handleCloseToast}
      />
    </>
  );
};

export default Home;
